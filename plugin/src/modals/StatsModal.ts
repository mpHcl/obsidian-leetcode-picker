import { Modal } from "obsidian";
import type { App } from "obsidian";
import type { Translator } from "../i18n";
import type { Stats } from "../types";

export class StatsModal extends Modal {
  private readonly stats: Stats;
  private readonly t: Translator;

  constructor(app: App, stats: Stats, t: Translator) {
    super(app);
    this.stats = stats;
    this.t = t;
  }

  onOpen(): void {
    const t = this.t;
    const root = this.contentEl;
    root.empty();
    root.addClass("leetcode-stats-root");

    try {
      const s = this.stats;

      root.createEl("h2", { text: t("statsTitle") });
      root.createEl("p", {
        text: t("statsInfo", { source: s.sourceName || "—", total: s.total }),
        cls: "leetcode-stats-info"
      });

      const grid = root.createDiv({ cls: "leetcode-stats-grid" });
      this.addStat(grid, t("statTotal"), s.total);
      this.addStat(grid, t("statDone"), s.done);
      this.addStat(grid, t("statRemaining"), s.remaining);
      this.addStat(grid, t("statProgress"), `${s.percent}%`);

      const progress = root.createDiv({ cls: "leetcode-progress" });
      const bar = progress.createDiv({ cls: "leetcode-progress-bar" });
      bar.style.width = `${Math.max(0, Math.min(100, s.percent))}%`;

      root.createEl("h3", { text: t("coreHeading") });
      root.createEl("p", { text: t("coreProgress", { done: s.coreDone, total: s.coreTotal }) });

      root.createEl("h3", { text: t("topicsHeading") });
      if (s.byTopic.length === 0) {
        root.createEl("p", { text: t("noTopicsFound") });
      } else {
        const table = root.createEl("table", { cls: "leetcode-stats-table" });
        const headRow = table.createEl("thead").createEl("tr");
        for (const label of [t("colTopic"), t("colDone"), t("colTotal"), "%"]) {
          headRow.createEl("th", { text: label });
        }

        const tbody = table.createEl("tbody");
        for (const topic of s.byTopic) {
          const row = tbody.createEl("tr");
          for (const value of [topic.name, topic.done, topic.total, `${topic.percent}%`]) {
            row.createEl("td", { text: String(value) });
          }
        }
      }

      const debug = root.createEl("details");
      debug.createEl("summary", { text: t("diagnostics") });
      debug.createEl("pre", {
        text: [
          `${t("diagFile")}: ${s.sourceName || "?"}`,
          `${t("diagLines")}: ${s.lineCount}`,
          `${t("diagFound")}: ${s.total}`,
          `${t("diagDone")}: ${s.done}`,
          `${t("diagCore")}: ${s.coreTotal}`
        ].join("\n")
      });

      const close = root.createEl("button", { text: t("close"), cls: "leetcode-stats-close" });
      close.addEventListener("click", () => this.close());
    } catch (error) {
      console.error("LeetCode Weighted Picker: stats render failed", error);
      root.empty();
      root.createEl("h2", { text: t("statsRenderError") });
      root.createEl("pre", {
        text: error instanceof Error ? `${error.name}: ${error.message}\n${error.stack ?? ""}` : String(error)
      });
    }
  }

  private addStat(container: HTMLElement, label: string, value: string | number): void {
    const card = container.createDiv({ cls: "leetcode-stat-card" });
    card.createDiv({ cls: "leetcode-stat-label", text: label });
    card.createDiv({ cls: "leetcode-stat-value", text: String(value) });
  }

  onClose(): void {
    this.contentEl.empty();
    this.contentEl.removeClass("leetcode-stats-root");
  }
}