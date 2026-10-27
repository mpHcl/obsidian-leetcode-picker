# LeetCode Weighted Picker 0.2.0

Obsidian plug in that picks random LeetCode problems from .md tables

## Installation

1. Copy `/plugin` into `.obsidian/plugins/`.
2. In Obsidian go to  **Settings → Community plugins** and enable plugin.
3. In **Settings → LeetCode Weighted Picker** set a path to file with problems e.g. `Algorithms/LeetCode.md`.

## Komendy

- `LeetCode: Pick random problem`
- `LeetCode: Pick 3 random problems`
- `LeetCode: Show stats`

## Table format

Plugin requires `.md` table like this: 

```markdown
| Problem | LC | Level | Done |
| --- | --- | --- | --- |
| ⭐ Two Sum | 1 | 🟢 Easy | |
| Valid Palindrome | 125 | 🟢 Easy | ✓ |
```

`✓`, `x`, `done` and `true` are treated equally as finished problems.
