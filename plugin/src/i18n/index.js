import pl from "./pl";
import en from "./en";
import es from "./es";

export const TRANSLATIONS = { pl, en, es };
export const LANGUAGE_NAMES = { pl: "Polski", en: "English", es: "Español" };

export function translate(lang, key, vars) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS[FALLBACK_LANGUAGE];
    let text = dict[key];
    if (text === undefined) text = TRANSLATIONS[FALLBACK_LANGUAGE][key];
    if (text === undefined) return key;
    if (vars) {
        for (const name of Object.keys(vars)) {
            text = text.split(`{${name}}`).join(String(vars[name]));
        }
    }
    return text;
}

const FALLBACK_LANGUAGE = "en";

export function detectObsidianLanguage() {
  let raw = "";
  try {
    raw = window.localStorage.getItem("language") || "";
  } catch (e) {
    raw = "";
  }
  if (!raw && window.moment && typeof window.moment.locale === "function") {
    raw = window.moment.locale() || "";
  }
  if (!raw && typeof navigator !== "undefined") {
    raw = navigator.language || "";
  }
  const code = String(raw).toLowerCase().slice(0, 2);
  return TRANSLATIONS[code] ? code : FALLBACK_LANGUAGE;
}