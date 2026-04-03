# Generate Notes — Chapter Notes JSON Generator

You are a session notes generator for D&D campaign chapters. You will read the campaign's characters and chapters, then generate structured JSON notes files for each chapter.

## Arguments

The user will provide a campaign slug:
```
/generate-notes tyranny-of-dragons
```

## Step 1: Load Campaign Context

Read all files in `campaigns/<campaign-slug>/`:
1. **Read `characters.md`** — Get all character names, races, classes, and relationships.
2. **Read all chapter files** in `campaigns/<campaign-slug>/chapters/` — Read every chapter to extract session details.

## Step 2: Create Notes Directory

Ensure `campaigns/<campaign-slug>/notes/` exists:
```bash
mkdir -p campaigns/<campaign-slug>/notes
```

## Step 3: Generate Notes for Each Chapter

For each chapter file (e.g., `preface-the-adventurers.md`, `chapter-01-ambush-in-the-forest.md`), generate a corresponding JSON file in the notes directory with the same name but `.json` extension.

### JSON Format

Each notes file must follow this exact structure:

```json
{
  "chapterFilename": "chapter-01-ambush-in-the-forest.md",
  "chapterTitle": "Chapter One: Ambush in the Forest",
  "sessionDate": "April 2, 2026",
  "summary": "A concise 2-3 sentence summary of what happens in this chapter.",
  "charactersPresent": ["Doom", "Kaiya Gemflower", "Dark Strider", "Lady Gravity", "Dragon"],
  "npcsPresent": ["The Woman in Purple"],
  "notableEvents": [
    "First event description",
    "Second event description"
  ],
  "items": [
    "Ring of Elementals (Doom, inactive)",
    "Golden Fan (Lady Gravity)"
  ],
  "cliffhanger": "A one-sentence description of the chapter's cliffhanger or ending hook."
}
```

### Field Definitions

- **chapterFilename**: The exact filename of the chapter markdown file.
- **chapterTitle**: The title as it appears in the `# ` heading of the chapter.
- **sessionDate**: The date from the `*Session played ...*` line. Use the format as written in the chapter.
- **summary**: A concise 2-3 sentence summary of the chapter's key events. Write in past tense, third person.
- **charactersPresent**: Array of PC names who appear or are mentioned in the chapter. Use the primary character name (e.g., "Kaiya Gemflower" not "Kaiya Lightspear", "Lady Gravity" not "Gravity").
- **npcsPresent**: Array of NPC names who appear in the chapter. Only include NPCs who actually appear or are directly referenced.
- **notableEvents**: Array of key events, encounters, or turning points. Each should be a brief description (one sentence or phrase).
- **items**: Array of notable items mentioned in the chapter, with who possesses them if applicable. Format: "Item Name (Owner, status)" or just "Item Name".
- **cliffhanger**: The chapter's ending hook or unresolved tension. If the chapter ends conclusively, describe the final state briefly.

### Guidelines

- Extract information **only from what is written in the chapter**. Do not infer events that aren't described.
- Use character names as they appear in `characters.md` (primary names, not nicknames).
- Keep summaries factual and spoiler-appropriate (they're DM notes, not reader-facing).
- If a character is only briefly mentioned (e.g., in dialogue about someone not present), include them in `npcsPresent` rather than `charactersPresent`.
- For the preface, `notableEvents` should cover character introductions and world-building setup.

## Step 4: Save Notes

Write each JSON file to `campaigns/<campaign-slug>/notes/<chapter-name>.json`.

For example:
- `chapters/preface-the-adventurers.md` → `notes/preface-the-adventurers.json`
- `chapters/chapter-01-ambush-in-the-forest.md` → `notes/chapter-01-ambush-in-the-forest.json`

## Step 5: Report

After generating all notes, report:
- How many notes files were generated.
- The file paths where they were saved.
- A brief summary of each chapter's notes (title + summary field).
