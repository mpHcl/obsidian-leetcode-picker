import { PluginSettingTab, Setting } from "obsidian";
import type { App } from "obsidian";
import type LeetCodeWeightedPicker from "./main";
import { LANGUAGE_CODES, LANGUAGE_NAMES, isLanguageCode } from "./i18n";
import type { LanguageSetting, PluginSettings } from "./types";

export const DEFAULT_SETTINGS: PluginSettings = {
  language: "auto",
  sourcePath: "",
  coreWeight: 4,
  easyWeight: 1,
  mediumWeight: 1.25,
  hardWeight: 1.5,
  recentPenalty: 0.2,
  recentDays: 3,
  reviewBoost: 2.5,
  history: {}
};

export class LeetCodePickerSettingTab extends PluginSettingTab {
  private readonly plugin: LeetCodeWeightedPicker;

  constructor(app: App, plugin: LeetCodeWeightedPicker) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const t = this.plugin.t.bind(this.plugin);
    containerEl.empty();
    containerEl.createEl("h2", { text: "LeetCode Weighted Picker" });

    new Setting(containerEl)
      .setName(t("settingLanguage"))
      .setDesc(t("settingLanguageDesc"))
      .addDropdown(dropdown => {
        dropdown.addOption("auto", t("languageAuto"));
        for (const code of LANGUAGE_CODES) {
          dropdown.addOption(code, LANGUAGE_NAMES[code]);
        }
        dropdown
          .setValue(this.plugin.settings.language)
          .onChange(async value => {
            const language: LanguageSetting = value === "auto" || isLanguageCode(value) ? value : "auto";
            this.plugin.settings.language = language;
            await this.plugin.saveSettings();
            this.display(); // re-render this tab in the newly selected language
          });
      });

    new Setting(containerEl)
      .setName(t("settingSource"))
      .setDesc(t("settingSourceDesc"))
      .addText(text => text
        .setPlaceholder("Algorithms/LeetCode.md")
        .setValue(this.plugin.settings.sourcePath)
        .onChange(async value => {
          this.plugin.settings.sourcePath = value.trim();
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t("settingCore"))
      .setDesc(t("settingCoreDesc"))
      .addText(text => text
        .setValue(String(this.plugin.settings.coreWeight))
        .onChange(async value => {
          this.plugin.settings.coreWeight = Number(value) || DEFAULT_SETTINGS.coreWeight;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t("settingBoost"))
      .setDesc(t("settingBoostDesc"))
      .addText(text => text
        .setValue(String(this.plugin.settings.reviewBoost))
        .onChange(async value => {
          this.plugin.settings.reviewBoost = Number(value) || DEFAULT_SETTINGS.reviewBoost;
          await this.plugin.saveSettings();
        }));
  }
}