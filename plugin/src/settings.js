import { PluginSettingTab, Setting } from "obsidian"
import { TRANSLATIONS, LANGUAGE_NAMES } from "./i18n";

export const DEFAULT_SETTINGS = {
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
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        const t = (key, vars) => this.plugin.t(key, vars);
        containerEl.empty();
        containerEl.createEl("h2", { text: "LeetCode Weighted Picker" });

        new Setting(containerEl)
            .setName(t("settingLanguage"))
            .setDesc(t("settingLanguageDesc"))
            .addDropdown(dropdown => {
                dropdown.addOption("auto", t("languageAuto"));
                for (const code of Object.keys(TRANSLATIONS)) {
                    dropdown.addOption(code, LANGUAGE_NAMES[code] || code);
                }
                dropdown
                    .setValue(this.plugin.settings.language)
                    .onChange(async value => {
                        this.plugin.settings.language = value;
                        await this.plugin.saveSettings();
                        this.display();
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