import type { Dictionary } from "./en";

const es: Dictionary = {
  cmdPickNext: "LeetCode: Sortear la siguiente tarea",
  cmdPickThree: "LeetCode: Sortear 3 tareas",
  cmdShowStats: "LeetCode: Mostrar estadísticas",

  pickedOne: "Tarea sorteada",
  pickedMany: "Tareas sorteadas",
  topicLine: "Tema: {topic}",
  openLeetCode: "Abrir LeetCode",
  markDone: "Marcar como hecha",
  doneButton: "✓ Hecha",
  markedDone: "{title} marcada como hecha.",
  pickAgain: "Sortear de nuevo",

  statsTitle: "LeetCode – estadísticas",
  statsInfo: "Origen: {source} · {total} tareas encontradas",
  statTotal: "Todas",
  statDone: "Completadas",
  statRemaining: "Pendientes",
  statProgress: "Progreso",
  coreHeading: "Core ⭐",
  coreProgress: "{done} / {total} completadas",
  topicsHeading: "Temas",
  noTopicsFound: "No se encontraron temas en las tablas.",
  colTopic: "Tema",
  colDone: "Hechas",
  colTotal: "Total",
  diagnostics: "Diagnóstico",
  diagFile: "Archivo",
  diagLines: "Líneas",
  diagFound: "Tareas encontradas",
  diagDone: "Hechas",
  diagCore: "Core",
  close: "Cerrar",
  statsRenderError: "Error al mostrar las estadísticas",
  noTopic: "Sin tema",

  settingLanguage: "Idioma",
  settingLanguageDesc: "Idioma de la interfaz del plugin. Los nombres de los comandos se actualizan al reiniciar Obsidian.",
  languageAuto: "Automático (idioma de Obsidian)",
  settingSource: "Archivo con la lista de tareas",
  settingSourceDesc: "Ruta de la nota con las tablas de LeetCode, p. ej. Algorithms/LeetCode.md",
  settingCore: "Peso Core ⭐",
  settingCoreDesc: "Peso base de la tarea marcada con estrella.",
  settingBoost: "Refuerzo de repaso",
  settingBoostDesc: "Multiplicador para las tareas que llevan tiempo sin sortearse.",

  sourceNotFound: "No se encontró el archivo con la lista de LeetCode. Configura la ruta en Settings → LeetCode Weighted Picker.",
  noUnfinished: "No se encontraron tareas pendientes.",
  markDoneFailed: "No se pudo marcar la tarea: {error}",
  unknownError: "error desconocido",
  statsFailed: "No se pudieron calcular las estadísticas: {error}"
};

export default es;