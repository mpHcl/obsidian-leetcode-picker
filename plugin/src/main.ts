import { Notice, Plugin, TFile, normalizePath } from "obsidian";
import type { TAbstractFile } from "obsidian";

import { PickerModal } from "./modals/PickerModal";
import { StatsModal } from "./modals/StatsModal";
import { LeetCodePickerSettingTab, DEFAULT_SETTINGS } from "./settings";
import { detectObsidianLanguage, isLanguageCode, translate } from "./i18n";
import type { LanguageCode, TranslateVars, TranslationKey } from "./i18n";
import { findTaskLine, parseAllTasks, parseTasks, splitTableRow } from "./parser";
import type { PluginSettings, Stats, Task, TopicStat } from "./types";

export default class LeetCodeWeightedPicker extends Plugin {
  settings!: PluginSettings;

  async onload(): Promise<void> {
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
  }

  getLanguage(): LanguageCode {
    const chosen = this.settings.language;
    return chosen !== "auto" && isLanguageCode(chosen) ? chosen : detectObsidianLanguage();
  }

  t(key: TranslationKey, vars?: TranslateVars): string {
    return translate(this.getLanguage(), key, vars);
  }

  async loadSettings(): Promise<void> {
    const data = (await this.loadData()) as Partial<PluginSettings> | null;
    // Copy history so the object in DEFAULT_SETTINGS is never mutated
    this.settings = { ...DEFAULT_SETTINGS, ...data, history: { ...data?.history } };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async getSourceFile(): Promise<TFile | null> {
    let file: TAbstractFile | null = null;
    if (this.settings.sourcePath) {
      file = this.app.vault.getAbstractFileByPath(normalizePath(this.settings.sourcePath));
    }
    if (!file) {
      file = this.app.workspace.getActiveFile();
    }
    if (!(file instanceof TFile) || file.extension !== "md") {
      new Notice(this.t("sourceNotFound"));
      return null;
    }
    return file;
  }

  weight(task: Task): number {
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

  weightedSample(tasks: Task[], count: number): Task[] {
    const pool = [...tasks];
    const result: Task[] = [];

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

  async pick(count: number): Promise<void> {
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

  async markDone(task: Task): Promise<boolean> {
    const file = await this.getSourceFile();
    if (!file) return false;

    try {
      await this.app.vault.process(file, markdown => {
        const lines = markdown.split(/\r?\n/);
        const index = findTaskLine(lines, task);
        if (index === -1) return markdown;

        const cells = splitTableRow(lines[index]);
        if (!cells || cells.length < 4) return markdown;

        // Only the Done cell changes; every other cell is kept as it was
        cells[3] = "✓";
        lines[index] = `| ${cells.join(" | ")} |`;
        return lines.join("\n");
      });

      return true;
    } catch (error) {
      console.error("LeetCode Weighted Picker: markDone failed", error);
      const reason = error instanceof Error && error.message ? error.message : this.t("unknownError");
      new Notice(this.t("markDoneFailed", { error: reason }));
      return false;
    }
  }

  async showStats(): Promise<void> {
    const file = await this.getSourceFile();
    if (!file) return;

    try {
      const markdown = await this.app.vault.read(file);
      const allTasks = parseAllTasks(markdown);
      const total = allTasks.length;
      const done = allTasks.filter(t => t.done).length;

      const topicMap = new Map<string, { name: string; done: number; total: number }>();
      for (const task of allTasks) {
        const name = task.topic || this.t("noTopic");
        let entry = topicMap.get(name);
        if (!entry) {
          entry = { name, done: 0, total: 0 };
          topicMap.set(name, entry);
        }
        entry.total += 1;
        if (task.done) entry.done += 1;
      }

      const lang = this.getLanguage();
      const byTopic: TopicStat[] = [...topicMap.values()]
        .map(x => ({ ...x, percent: x.total ? Math.round((x.done / x.total) * 100) : 0 }))
        .sort((a, b) => a.name.localeCompare(b.name, lang));

      const stats: Stats = {
        sourceName: file.path,
        lineCount: markdown.split(/\r?\n/).length,
        total,
        done,
        remaining: total - done,
        percent: total ? Math.round((done / total) * 100) : 0,
        coreTotal: allTasks.filter(t => t.core).length,
        coreDone: allTasks.filter(t => t.core && t.done).length,
        byTopic
      };

      new StatsModal(this.app, stats, this.t.bind(this)).open();
    } catch (error) {
      console.error("LeetCode Weighted Picker: showStats failed", error);
      new Notice(this.t("statsFailed", { error: error instanceof Error ? error.message : String(error) }));
    }
  }
}