import type { Task } from "./types";

// Pure functions with no Obsidian dependency, so they can be tested on their own.

export function splitTableRow(line: string): string[] | null {
  if (!/^\s*\|.*\|\s*$/.test(line)) return null;
  return line.trim().slice(1, -1).split("|").map(cell => cell.trim());
}

export function isDoneValue(value: string | undefined): boolean {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "x" || normalized === "✓" || normalized === "✔" || normalized === "done" || normalized === "true";
}

export function getSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseAllTasks(markdown: string): Task[] {
  const lines = markdown.split(/\r?\n/);
  const tasks: Task[] = [];
  let currentTopic = "";
  let currentSubtopic = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const h2 = line.match(/^##\s+(.+)/);
    const subHeading = line.match(/^###\s+(.+)/) ?? line.match(/^####\s+(.+)/) ?? line.match(/^#####\s+(.+)/);
    if (h2) {
      currentTopic = h2[1].trim();
      currentSubtopic = "";
    } else if (subHeading) {
      currentSubtopic = subHeading[1].trim();
    }

    const cells = splitTableRow(line);
    if (!cells || cells.length < 4) continue;
    if (!/^\d+$/.test(cells[1])) continue;
    if (/^-+$/.test(cells[0]) || /^:?-+:?$/.test(cells[1])) continue;

    const rawTitle = cells[0];
    const title = rawTitle.replace(/⭐/g, "").trim();

    tasks.push({
      title,
      id: cells[1],
      difficulty: cells[2],
      core: rawTitle.includes("⭐"),
      done: isDoneValue(cells[3]),
      topic: currentSubtopic || currentTopic,
      slug: getSlug(title),
      lineIndex: i
    });
  }

  return tasks;
}

export function parseTasks(markdown: string): Task[] {
  return parseAllTasks(markdown).filter(task => !task.done);
}

// Returns the index of the task's row, or -1 if it is gone. Tries the remembered
// position first and falls back to matching by id and title if the file changed.
export function findTaskLine(lines: string[], task: Task): number {
  if (task.lineIndex >= 0 && task.lineIndex < lines.length) {
    const cells = splitTableRow(lines[task.lineIndex]);
    if (cells && cells.length >= 4 && cells[1] === String(task.id)) return task.lineIndex;
  }

  for (let i = 0; i < lines.length; i++) {
    const cells = splitTableRow(lines[i]);
    if (!cells || cells.length < 4) continue;
    if (cells[1] !== String(task.id)) continue;

    const title = cells[0].replace(/⭐/g, "").trim();
    if (title === task.title) return i;
  }

  return -1;
}