Add scene/illustration images to a campaign chapter markdown file.

## Arguments
$ARGUMENTS — expects: `<campaign-slug> <chapter-filename> <image-path-1> [image-path-2] ...`

Example: `/add-chapter-images tyranny-of-dragons preface-the-adventurers.md ~/Downloads/campfire.png ~/Downloads/dragon-battle.png`

## Instructions

1. **Parse arguments**: Split `$ARGUMENTS` into campaign slug (first token), chapter filename (second token), and image paths (remaining tokens). If no arguments provided, ask the user for the campaign slug, chapter filename, and image paths.

2. **Read the chapter markdown**: Read `campaigns/<slug>/chapters/<filename>` and understand its structure — identify section breaks (`---`), bold character name openings (e.g., `**Kaiya**`), headings, and other structural landmarks.

3. **Copy images**: Create directory `campaigns/<slug>/images/chapters/` if it doesn't exist. Copy each image with a normalized filename (lowercase, spaces→hyphens, e.g., `campfire-scene.png`, `dragon-battle.png`).

4. **Ask the user where to place each image**: For each image, present the chapter's structural landmarks as insertion options:
   - Section breaks (`---`)
   - Bold character name openings (e.g., lines starting with `**Name**`)
   - Headings (`#`, `##`, etc.)
   - "Beginning of file" and "End of file"

   Ask the user which landmark each image should be inserted before or after.

5. **Insert `<img>` tags**: At the chosen locations, insert image tags cycling through these 4 layout styles:

   **Style 1** — Float right, 360px:
   ```html
   <img src="/api/campaigns/<slug>/images/chapters/<filename>" alt="<description>" style="float: right; margin: 0 0 16px 20px; width: 360px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);" />
   ```

   **Style 2** — Float left, 360px:
   ```html
   <img src="/api/campaigns/<slug>/images/chapters/<filename>" alt="<description>" style="float: left; margin: 0 20px 16px 0; width: 360px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);" />
   ```

   **Style 3** — Centered block, 480px:
   ```html
   <img src="/api/campaigns/<slug>/images/chapters/<filename>" alt="<description>" style="display: block; margin: 12px auto 16px; width: 480px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);" />
   ```

   **Style 4** — Float right, smaller 300px:
   ```html
   <img src="/api/campaigns/<slug>/images/chapters/<filename>" alt="<description>" style="float: right; margin: 0 0 16px 20px; width: 300px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);" />
   ```

   Use a sensible alt text derived from the image filename or ask the user for a brief description.

6. **Add clear divs**: After float images (styles 1, 2, and 4), insert `<div style="clear: both;"></div>` before the next structural landmark (heading, `---`, or bold character opening) to prevent float overlap.

7. **Write the updated file**: Save the modified chapter markdown.

8. **Report results**: Show which images were placed and where in the chapter.

## Image URL format
`/api/campaigns/<slug>/images/chapters/<filename>`

The DnD bookshelf backend serves these images from `campaigns/<slug>/images/chapters/`.
