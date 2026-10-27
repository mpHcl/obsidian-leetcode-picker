// Czyste funkcje bez zależności od Obsidiana: łatwo je testować osobno.

export function splitTableRow(line) {
  if (!/^\s*\|.*\|\s*$/.test(line)) return null;
  return line.trim().slice(1, -1).split("|").map(cell => cell.trim());
}

export function isDoneValue(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "x" || normalized === "✓" || normalized === "✔" || normalized === "done" || normalized === "true";
}

export function getSlug(title) {
  return title
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseAllTasks(markdown) {
  const lines = markdown.split(/\r?\n/);
  const tasks = [];
  let currentTopic = "";
  let currentSubtopic = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const h2 = line.match(/^##\s+(.+)/);
    const h3 = line.match(/^###\s+(.+)/);
    const h4 = line.match(/^####\s+(.+)/);
    const h5 = line.match(/^#####\s+(.+)/);
    if (h2) {
      currentTopic = h2[1].trim();
      currentSubtopic = "";
    } else if (h3 || h4 || h5) {
      currentSubtopic = (h3 || h4 || h5)[1].trim();
    }

    const cells = splitTableRow(line);
    if (!cells || cells.length < 4) continue;
    if (!/^\d+$/.test(cells[1])) continue;
    if (/^-+$/.test(cells[0]) || /^:?-+:?$/.test(cells[1])) continue;

    const rawTitle = cells[0];
    const id = cells[1];
    const difficulty = cells[2];
    const done = isDoneValue(cells[3]);
    const core = rawTitle.includes("⭐");
    const title = rawTitle.replace(/⭐/g, "").trim();

    tasks.push({
      title,
      id,
      difficulty,
      core,
      done,
      topic: currentSubtopic || currentTopic,
      slug: getSlug(title),
      lineIndex: i
    });
  }

  return tasks;
}

export function parseTasks(markdown) {
  return parseAllTasks(markdown).filter(task => !task.done);
}

export function findTaskLine(lines, task) {
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