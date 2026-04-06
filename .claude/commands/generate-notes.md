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
  "cliffhanger": "A one-sentence description of the chapter's cliffhanger or ending hook.",
  "characterNotes": {
    "Doom": {
      "characterName": "Doom",
      "summary": "One-sentence summary of what this character did this session.",
      "keyActions": ["Led the charge into the ambush", "Used Ring of Elementals for the first time"],
      "characterDevelopment": ["Showed reluctance to lead despite others looking to him"],
      "itemChanges": ["Acquired Ring of Elementals (inactive)"],
      "relationshipChanges": ["Growing trust with Kaiya after she healed him"],
      "privateKnowledge": ["Overheard the cultists mention a name the others didn't catch"]
    }
  },
  "dmNotes": {
    "whatWorkedWell": ["The ambush encounter created genuine tension"],
    "whatDidntWork": ["The travel montage felt rushed"],
    "playerEngagement": ["Dragon's player was very engaged during the combat"],
    "plotHooksPlanted": ["The Woman in Purple escaped — players want to find her"],
    "rulesNotes": ["Need to review grappling rules before next session"],
    "rememberNextSession": ["The party left a wounded cultist tied to a tree"]
  }
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
- **characterNotes**: An object keyed by character name, with one entry for every character listed in `charactersPresent`. Each entry contains:
  - **characterName**: The character's primary name (must match the key).
  - **summary**: A one-sentence summary of what this character did this session.
  - **keyActions**: Array of notable actions this character took (combat moves, spells cast, social interactions).
  - **characterDevelopment**: Array of personality moments, growth, or internal conflict shown.
  - **itemChanges**: Array of items gained, lost, or used in a notable way. Empty array if none.
  - **relationshipChanges**: Array of relationship shifts with other PCs or NPCs.
  - **privateKnowledge**: Array of things only this character would know (overheard conversations, secret observations, private revelations). Empty array if none.
- **dmNotes**: Reflective DM insights about the session:
  - **whatWorkedWell**: Array of encounters, moments, or design choices that landed well.
  - **whatDidntWork**: Array of things that fell flat or could be improved.
  - **playerEngagement**: Array of observations about player engagement and investment.
  - **plotHooksPlanted**: Array of unresolved threads or hooks set up for future sessions.
  - **rulesNotes**: Array of rules questions, rulings made, or mechanics to review.
  - **rememberNextSession**: Array of things the DM should remember for the next session (loose ends, promises, environmental state).

### Guidelines

- Extract information **only from what is written in the chapter**. Do not infer events that aren't described.
- Use character names as they appear in `characters.md` (primary names, not nicknames).
- Keep summaries factual and spoiler-appropriate (they're DM notes, not reader-facing).
- If a character is only briefly mentioned (e.g., in dialogue about someone not present), include them in `npcsPresent` rather than `charactersPresent`.
- For the preface, `notableEvents` should cover character introductions and world-building setup.
- Generate a `characterNotes` entry for **every** character in `charactersPresent`. Do not skip any.
- Character notes should capture what the character specifically did, not repeat general party events.
- `privateKnowledge` is for information asymmetry — things one character learned that others didn't.
- DM notes should be honest and reflective. They are for the DM's eyes only.
- For the preface, DM notes can focus on session-zero observations (character dynamics, player interests, what hooks excited them).

## Step 4: Save Chapter Notes

Write each JSON file to `campaigns/<campaign-slug>/notes/<chapter-name>.json`.

For example:
- `chapters/preface-the-adventurers.md` → `notes/preface-the-adventurers.json`
- `chapters/chapter-01-ambush-in-the-forest.md` → `notes/chapter-01-ambush-in-the-forest.json`

## Step 5: Generate Campaign Overview

After generating all per-chapter notes, synthesize them into a single `campaign-overview.json` file that captures the overarching story across all sessions. This is a campaign-level note (not tied to any session).

Read ALL the chapter notes you just generated and produce:

```json
{
  "title": "Campaign Overview",
  "keyCharacters": [
    {
      "name": "Character Name",
      "type": "PC or NPC",
      "description": "Brief description — race/class, role in the story, and current status."
    }
  ],
  "storyArcs": [
    {
      "name": "Arc Name",
      "description": "Summary of this plot thread — where it started, key developments, and current state.",
      "sessions": ["Chapter One: ...", "Chapter Three: ..."]
    }
  ],
  "keyItems": [
    {
      "name": "Item Name",
      "holder": "Current holder or 'Unknown'",
      "significance": "Why this item matters to the story."
    }
  ],
  "keyEvents": [
    "Pivotal moment #1 — brief description and which session it occurred in.",
    "Pivotal moment #2 — brief description and which session it occurred in."
  ],
  "unresolvedThreads": [
    "Open plot hook or mystery #1",
    "Open plot hook or mystery #2"
  ],
  "relationshipMap": [
    {
      "parties": ["Character A", "Character B"],
      "nature": "Alliance, rivalry, mentorship, romance, etc.",
      "notes": "Brief description of how this relationship has evolved."
    }
  ]
}
```

### Campaign Overview Field Definitions

- **title**: Always "Campaign Overview".
- **keyCharacters**: All recurring PCs and significant NPCs. Include every PC and any NPC who appears in 2+ sessions or drives a major plot point.
- **storyArcs**: Major plot threads that span multiple sessions. Trace each arc from its introduction through its developments. Include which sessions are relevant.
- **keyItems**: Significant items that affect the narrative — magical items, quest objects, keys, etc. Track who currently holds them.
- **keyEvents**: Pivotal moments that changed the course of the campaign. These are the "turning points" a DM would want to reference.
- **unresolvedThreads**: Open plot hooks, unanswered mysteries, escaped villains, unfulfilled promises — anything the DM should remember as active.
- **relationshipMap**: Notable alliances, rivalries, and evolving dynamics between characters (PC-PC, PC-NPC, or NPC-NPC if relevant to the party).

### Campaign Overview Guidelines

- Synthesize across ALL chapters — this is a bird's-eye view, not a per-session recap.
- Keep descriptions concise but informative enough to jog a DM's memory.
- For story arcs, focus on the narrative thread rather than individual session details.
- Unresolved threads should be actionable — things the DM might pick up in future sessions.
- Only include relationships that have narrative weight (not every casual interaction).

Save to `campaigns/<campaign-slug>/notes/campaign-overview.json`.

## Step 6: Report

After generating all notes, report:
- How many chapter notes files were generated.
- Whether the campaign overview was generated.
- The file paths where they were saved.
- A brief summary of each chapter's notes (title + summary field).
