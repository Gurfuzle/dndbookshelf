Add character images to a campaign's characters.md file.

## Arguments
$ARGUMENTS — expects: `<campaign-slug> <image-path-1> [image-path-2] ...`

Example: `/add-character-images tyranny-of-dragons ~/Downloads/Dragon.png ~/Downloads/Doom.png`

## Instructions

1. **Parse arguments**: Split `$ARGUMENTS` into campaign slug (first token) and image paths (remaining tokens). If no arguments provided, ask the user for the campaign slug and image paths.

2. **Read characters.md**: Read `campaigns/<slug>/characters.md` and extract all `### Name` headings from both the `## Player Characters` and `## Notable NPCs` sections. Build a list of character names.

3. **Match images to characters**: For each image path, fuzzy-match the filename (without extension) to a character name:
   - Strip the file extension
   - Replace hyphens and underscores with spaces
   - Case-insensitive comparison
   - Match if the filename is a substring of the character name, or vice versa
   - For names with parenthetical nicknames like `Kaiya Gemflower (called "Kaiya Lightspear")`, also match against the base name before the parenthesis
   - If no match found, report it and skip

4. **Copy images**: Create directory `campaigns/<slug>/images/characters/` if it doesn't exist. Copy each matched image with a normalized filename (lowercase, spaces→hyphens, e.g., `dragon.png`, `kaiya-gemflower.png`).

5. **Insert image tags**: For each matched character, insert an `<img>` tag immediately after the `### Name` heading line. Cycle through these 4 layout styles in order across characters:

   **Style 1** — Float right, 280px:
   ```html
   <img src="/api/campaigns/<slug>/images/characters/<filename>" alt="<Name>" style="float: right; margin: 0 0 16px 20px; width: 280px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);" />
   ```

   **Style 2** — Float left, 280px:
   ```html
   <img src="/api/campaigns/<slug>/images/characters/<filename>" alt="<Name>" style="float: left; margin: 0 20px 16px 0; width: 280px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);" />
   ```

   **Style 3** — Centered block, 360px:
   ```html
   <img src="/api/campaigns/<slug>/images/characters/<filename>" alt="<Name>" style="display: block; margin: 12px auto 16px; width: 360px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);" />
   ```

   **Style 4** — Float right, smaller 220px:
   ```html
   <img src="/api/campaigns/<slug>/images/characters/<filename>" alt="<Name>" style="float: right; margin: 0 0 16px 20px; width: 220px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);" />
   ```

6. **Replace existing images**: If a character already has an `<img>` tag on the line immediately following the `### Name` heading, replace it with the new one.

7. **Add clear divs**: After each character section (before the next `### ` heading or section boundary), if the image used a float style, insert `<div style="clear: both;"></div>` before the next heading to prevent float overlap.

8. **Write the updated file**: Save the modified `characters.md`.

9. **Report results**: Show which characters were matched and which images were unmatched.

## Image URL format
`/api/campaigns/<slug>/images/characters/<filename>`

The DnD bookshelf backend serves these images from `campaigns/<slug>/images/characters/`.
