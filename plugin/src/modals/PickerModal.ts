import { Modal, Notice } from "obsidian";
import type { App } from "obsidian";
import type LeetCodeWeightedPicker from "../main";
import type { Task } from "../types";

export class PickerModal extends Modal {
  private readonly picks: Task[];
  private readonly plugin: LeetCodeWeightedPicker;

  constructor(app: App, picks: Task[], plugin: LeetCodeWeightedPicker) {
    super(app);
    this.picks = picks;
    this.plugin = plugin;
  }

  onOpen(): void {
    const t = this.plugin.t.bind(this.plugin);
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.picks.length === 1 ? t("pickedOne") : t("pickedMany") });

    for (const [i, p] of this.picks.entries()) {
      const box = contentEl.createDiv({ cls: "leetcode-picker-card" });
      const heading = this.picks.length > 1 ? `${i + 1}. ${p.title}` : p.title;
      box.createEl("h3", { text: heading });

      const meta = box.createDiv({ cls: "leetcode-picker-meta" });
      meta.setText(`LeetCode #${p.id} · ${p.difficulty}${p.core ? " · ⭐ Core" : ""}`);
      if (p.topic) meta.createEl("div", { text: t("topicLine", { topic: p.topic }) });

      const actions = box.createDiv({ cls: "leetcode-picker-actions" });

      const openBtn = actions.createEl("button", { text: t("openLeetCode") });
      openBtn.addEventListener("click", () => {
        window.open(`https://leetcode.com/problems/${p.slug}/`, "_blank");
      });

      const doneBtn = actions.createEl("button", { text: t("markDone") });
      doneBtn.addEventListener("click", async () => {
        doneBtn.disabled = true;
        const ok = await this.plugin.markDone(p);
        if (ok) {
          doneBtn.setText(t("doneButton"));
          new Notice(t("markedDone", { title: p.title }));
        } else {
          doneBtn.disabled = false;
        }
      });
    }

    const footer = contentEl.createDiv({ cls: "leetcode-picker-footer" });
    const again = footer.createEl("button", { text: t("pickAgain") });
    again.addEventListener("click", async () => {
      this.close();
      await this.plugin.pick(1);
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}