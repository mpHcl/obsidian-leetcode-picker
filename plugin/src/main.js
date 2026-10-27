import { Plugin, Notice, TFile, normalizePath } from "obsidian";

import { PickerModal } from "./modals/PickerModal";
import { StatsModal } from "./modals/StatsModal";
import { LeetCodePickerSettingTab, DEFAULT_SETTINGS } from "./settings";
import { TRANSLATIONS, translate, detectObsidianLanguage } from "./i18n";
import { parseTasks, parseAllTasks, findTaskLine, splitTableRow } from "./parser";

export default class LeetCodeWeightedPicker extends Plugin {
  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: "pick-next",
      name: this.t("cmdPickNext"),
      callback: () => this.pick(1)
    });

    this.addCommand({
      id: "pick-three",
      name: this.t("cmdPickThree"),
      callback: () => this.pick(3)
    });

    this.addCommand({
      id: "show-stats",
      name: this.t("cmdShowStats"),
      callback: () => this.showStats()
    });

    this.addSettingTab(new LeetCodePickerSettingTab(this.app, this));
    this.addStyles();
  }

  getLanguage() {
    const chosen = this.settings && this.settings.language;
    if (chosen && chosen !== "auto" && TRANSLATIONS[chosen]) return chosen;
    return detectObsidianLanguage();
  }

  t(key, vars) {
    return translate(this.getLanguage(), key, vars);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.settings.history = this.settings.history || {};
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  addStyles() {
    const style = document.createElement("style");
    style.id = "leetcode-weighted-picker-style";
    style.textContent = `
      .leetcode-picker-card { border: 1px solid var(--background-modifier-border); border-radius: 8px; padding: 12px; margin: 10px 0; }
      .leetcode-picker-card h3 { margin: 0 0 5px 0; }
      .leetcode-picker-meta { color: var(--text-muted); margin-bottom: 10px; }
      .leetcode-picker-actions { display: flex; gap: 8px; flex-wrap: wrap; }
      .leetcode-picker-footer { margin-top: 14px; }
      .leetcode-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 14px 0; }
      .leetcode-stat-card { border: 1px solid var(--background-modifier-border); border-radius: 8px; padding: 10px; text-align: center; }
      .leetcode-stat-label { color: var(--text-muted); font-size: 0.85em; }
      .leetcode-stat-value { font-size: 1.4em; font-weight: 600; margin-top: 4px; }
      .leetcode-progress { height: 10px; background: var(--background-modifier-border); border-radius: 6px; overflow: hidden; margin-bottom: 18px; }
      .leetcode-progress-bar { height: 100%; background: var(--interactive-accent); transition: width 0.2s ease; }
      .leetcode-stats-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      .leetcode-stats-table th, .leetcode-stats-table td { padding: 6px 8px; border-bottom: 1px solid var(--background-modifier-border); text-align: left; }
      @media (max-width: 600px) { .leetcode-stats-grid { grid-template-columns: repeat(2, 1fr); } }
    `;
    document.head.appendChild(style);
  }

  async getSourceFile() {
    let file = null;
    if (this.settings.sourcePath) {
      file = this.app.vault.getAbstractFileByPath(normalizePath(this.settings.sourcePath));
    }
    if (!file) {
      const active = this.app.workspace.getActiveFile();
      if (active) file = active;
    }
    if (!(file instanceof TFile) || file.extension !== "md") {
      new Notice(this.t("sourceNotFound"));
      return null;
    }
    return file;
  }

  weight(task) {
    let w = 1;
    if (task.core) w *= this.settings.coreWeight;
    if (task.difficulty.includes("🟢")) w *= this.settings.easyWeight;
    if (task.difficulty.includes("🟡")) w *= this.settings.mediumWeight;
    if (task.difficulty.includes("🔴")) w *= this.settings.hardWeight;

    const last = this.settings.history[task.id];
    if (last) {
      const ageDays = (Date.now() - last) / 86400000;
      if (ageDays < this.settings.recentDays) w *= this.settings.recentPenalty;
      else w *= this.settings.reviewBoost;
    } else {
      w *= 1.25;
    }
    return Math.max(w, 0.01);
  }

  weightedSample(tasks, count) {
    const pool = [...tasks];
    const result = [];

    while (pool.length && result.length < count) {
      const weights = pool.map(t => this.weight(t));
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      let idx = 0;
      for (; idx < pool.length; idx++) {
        r -= weights[idx];
        if (r <= 0) break;
      }
      idx = Math.min(idx, pool.length - 1);
      result.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return result;
  }

  async pick(count) {
    const file = await this.getSourceFile();
    if (!file) return;

    const markdown = await this.app.vault.read(file);
    const tasks = parseTasks(markdown);

    if (!tasks.length) {
      new Notice(this.t("noUnfinished"));
      return;
    }

    const picks = this.weightedSample(tasks, Math.min(count, tasks.length));
    for (const p of picks) this.settings.history[p.id] = Date.now();
    await this.saveSettings();

    new PickerModal(this.app, picks, this).open();
  }

  async markDone(task) {
    const file = await this.getSourceFile();
    if (!file) return false;

    try {
      await this.app.vault.process(file, markdown => {
        const lines = markdown.split(/\r?\n/);
        const index = findTaskLine(lines, task);

        if (index === -1) return markdown;

        const cells = splitTableRow(lines[index]);
        if (!cells || cells.length < 4) return markdown;

        cells[3] = "✓";
        lines[index] = `| ${cells.join(" | ")} |`;
        return lines.join("\n");
      });

      return true;
    } catch (error) {
      console.error("LeetCode Weighted Picker: markDone failed", error);
      new Notice(this.t("markDoneFailed", { error: error?.message || this.t("unknownError") }));
      return false;
    }
  }

  async showStats() {
    const file = await this.getSourceFile();
    if (!file) return;

    try {
      const markdown = await this.app.vault.read(file);
      const allTasks = parseAllTasks(markdown);
      const total = allTasks.length;
      const done = allTasks.filter(t => t.done).length;
      const remaining = total - done;
      const percent = total ? Math.round((done / total) * 100) : 0;
      const coreTotal = allTasks.filter(t => t.core).length;
      const coreDone = allTasks.filter(t => t.core && t.done).length;

      const topicMap = new Map();
      for (const task of allTasks) {
        const name = task.topic || this.t("noTopic");
        if (!topicMap.has(name)) topicMap.set(name, { name, done: 0, total: 0 });
        const entry = topicMap.get(name);
        entry.total += 1;
        if (task.done) entry.done += 1;
      }

      const lang = this.getLanguage();
      const byTopic = [...topicMap.values()]
        .map(x => ({ ...x, percent: x.total ? Math.round((x.done / x.total) * 100) : 0 }))
        .sort((a, b) => a.name.localeCompare(b.name, lang));

      new StatsModal(this.app, {
        sourceName: file.path,
        lineCount: markdown.split(/\r?\n/).length,
        total, done, remaining, percent, coreTotal, coreDone, byTopic
      }, (key, vars) => this.t(key, vars)).open();
    } catch (error) {
      console.error("LeetCode Weighted Picker: showStats failed", error);
      new Notice(this.t("statsFailed", { error: error instanceof Error ? error.message : String(error) }));
    }
  }

  onunload() {
    document.getElementById("leetcode-weighted-picker-style")?.remove();
  }
}