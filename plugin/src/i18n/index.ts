import { moment } from "obsidian";
import en from "./en";
import pl from "./pl";
import es from "./es";
import type { Dictionary, TranslationKey } from "./en";

export type { Dictionary, TranslationKey };

export type LanguageCode = "pl" | "en" | "es";
export type TranslateVars = Record<string, string | number>;
export type Translator = (key: TranslationKey, vars?: TranslateVars) => string;

export const TRANSLATIONS: Record<LanguageCode, Dictionary> = { pl, en, es };

export const LANGUAGE_CODES = Object.keys(TRANSLATIONS) as LanguageCode[];

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  pl: "Polski",
  en: "English",
  es: "Español"
};

export const FALLBACK_LANGUAGE: LanguageCode = "en";

export function isLanguageCode(value: string): value is LanguageCode {
  return (LANGUAGE_CODES as string[]).includes(value);
}

export function detectObsidianLanguage(): LanguageCode {
  let raw = "";
  try {
    raw = window.localStorage.getItem("language") ?? "";
  } catch {
    raw = "";
  }
  if (!raw) raw = moment.locale() || "";
  if (!raw && typeof navigator !== "undefined") raw = navigator.language || "";

  const code = raw.toLowerCase().slice(0, 2);
  return isLanguageCode(code) ? code : FALLBACK_LANGUAGE;
}

export function translate(lang: LanguageCode, key: TranslationKey, vars?: TranslateVars): string {
  let text: string = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS[FALLBACK_LANGUAGE][key] ?? key;
  if (vars) {
    for (const name of Object.keys(vars)) {
      text = text.split(`{${name}}`).join(String(vars[name]));
    }
  }
  return text;
}