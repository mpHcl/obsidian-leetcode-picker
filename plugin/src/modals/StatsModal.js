import { Modal } from "obsidian";


export class StatsModal extends Modal {
  constructor(app, stats, t) {
    super(app);
    this.stats = stats;
    this.t = t;
  }

  onOpen() {
    const t = this.t;
    const root = this.contentEl;
    while (root.firstChild) root.removeChild(root.firstChild);

    try {
      const s = this.stats || {};
      root.style.minWidth = "520px";
      root.style.maxHeight = "75vh";
      root.style.overflowY = "auto";

      const h2 = document.createElement("h2");
      h2.textContent = t("statsTitle");
      root.appendChild(h2);

      const info = document.createElement("p");
      info.textContent = t("statsInfo", { source: s.sourceName || "—", total: s.total ?? 0 });
      info.className = "leetcode-stats-info";
      root.appendChild(info);

      const grid = document.createElement("div");
      grid.className = "leetcode-stats-grid";
      root.appendChild(grid);
      this.addStat(grid, t("statTotal"), s.total ?? 0);
      this.addStat(grid, t("statDone"), s.done ?? 0);
      this.addStat(grid, t("statRemaining"), s.remaining ?? 0);
      this.addStat(grid, t("statProgress"), `${s.percent ?? 0}%`);

      const progress = document.createElement("div");
      progress.className = "leetcode-progress";
      const bar = document.createElement("div");
      bar.className = "leetcode-progress-bar";
      bar.style.width = `${Math.max(0, Math.min(100, Number(s.percent) || 0))}%`;
      progress.appendChild(bar);
      root.appendChild(progress);

      const coreTotal = Number(s.coreTotal) || 0;
      const coreSection = document.createElement("div");
      const coreTitle = document.createElement("h3");
      coreTitle.textContent = t("coreHeading");
      coreSection.appendChild(coreTitle);
      const coreText = document.createElement("p");
      coreText.textContent = t("coreProgress", { done: s.coreDone || 0, total: coreTotal });
      coreSection.appendChild(coreText);
      root.appendChild(coreSection);

      const topics = Array.isArray(s.byTopic) ? s.byTopic : [];
      const topicTitle = document.createElement("h3");
      topicTitle.textContent = t("topicsHeading");
      root.appendChild(topicTitle);

      if (topics.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = t("noTopicsFound");
        root.appendChild(empty);
      } else {
        const table = document.createElement("table");
        table.className = "leetcode-stats-table";
        const thead = document.createElement("thead");
        const headRow = document.createElement("tr");
        for (const text of [t("colTopic"), t("colDone"), t("colTotal"), "%"]) {
          const th = document.createElement("th");
          th.textContent = text;
          headRow.appendChild(th);
        }
        thead.appendChild(headRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        for (const topic of topics) {
          const row = document.createElement("tr");
          for (const value of [topic.name, topic.done, topic.total, `${topic.percent}%`]) {
            const td = document.createElement("td");
            td.textContent = String(value ?? "");
            row.appendChild(td);
          }
          tbody.appendChild(row);
        }
        table.appendChild(tbody);
        root.appendChild(table);
      }

      const debug = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = t("diagnostics");
      debug.appendChild(summary);
      const debugText = document.createElement("pre");
      debugText.textContent = [
        `${t("diagFile")}: ${s.sourceName || "?"}`,
        `${t("diagLines")}: ${s.lineCount ?? "?"}`,
        `${t("diagFound")}: ${s.total ?? 0}`,
        `${t("diagDone")}: ${s.done ?? 0}`,
        `${t("diagCore")}: ${coreTotal}`
      ].join("\n");
      debug.appendChild(debugText);
      root.appendChild(debug);

      const close = document.createElement("button");
      close.textContent = t("close");
      close.style.marginTop = "16px";
      close.addEventListener("click", () => this.close());
      root.appendChild(close);
    } catch (error) {
      console.error("LeetCode Weighted Picker: stats render failed", error);
      while (root.firstChild) root.removeChild(root.firstChild);
      const h = document.createElement("h2");
      h.textContent = t("statsRenderError");
      root.appendChild(h);
      const p = document.createElement("pre");
      p.textContent = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack || ""}` : String(error);
      root.appendChild(p);
    }
  }

  addStat(container, label, value) {
    const card = document.createElement("div");
    card.className = "leetcode-stat-card";
    const labelEl = document.createElement("div");
    labelEl.className = "leetcode-stat-label";
    labelEl.textContent = label;
    const valueEl = document.createElement("div");
    valueEl.className = "leetcode-stat-value";
    valueEl.textContent = String(value);
    card.appendChild(labelEl);
    card.appendChild(valueEl);
    container.appendChild(card);
  }

  onClose() {
    while (this.contentEl.firstChild) this.contentEl.removeChild(this.contentEl.firstChild);
  }
}