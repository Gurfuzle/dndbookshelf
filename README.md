# DnD Bookshelf

A novel-style campaign reader for D&D sessions. Campaigns are written as markdown chapters and served through a bookshelf UI.

## Stack

- **Backend**: Spring Boot 3.4 / Java 17 — serves campaign content from the filesystem
- **Frontend**: React 19 / TypeScript / Vite / Tailwind CSS — bookshelf UI with chapter reader

## Prerequisites

- Java 17
- Node.js 22+
- Gradle 8.12 (installed automatically by `setup.sh` on the server)

## Local Development

**Backend** (port 8024):

```bash
cd backend
./gradlew bootRun
```

**Frontend** (port 5173, proxies API to 8024):

```bash
cd frontend
npm install
npm run dev
```

## Campaign Content

Campaign markdown files live in the `campaigns/` directory (gitignored). Each campaign is a subdirectory:

```
campaigns/
  tyranny-of-dragons/
    overview.md          # Campaign description + optional YAML frontmatter
    characters.md        # Player and NPC character descriptions
    chapters/
      preface-the-adventurers.md
      chapter-01-ambush-in-the-forest.md
    notes/               # Generated JSON session notes
      chapter-01-ambush-in-the-forest.json
    transcripts/         # Raw session transcripts
```

The campaigns path is configurable via `app.campaigns-path` in `application.yml` (default: `../campaigns`). Override for production with `APP_CAMPAIGNS_PATH` env var or a `production.yml` file.

## Deploying Campaigns

Campaign content is deployed separately from the application code:

```bash
./deploy-campaigns.sh
```

This pushes the local `campaigns/` directory to the production NAS via SCP.

## Production Setup

Run `setup.sh` on the production server. It builds the app, configures Nginx with HTTPS, and creates a systemd service.

## Integration

Hosted at `https://dndbookshelf.swensenfamily.local` in production.

This app provides an export API (`GET /api/campaigns/{slug}/export`) used by [rpgdashboard](https://github.com/Gurfuzle/rpgdashboard) to import campaigns, characters, sessions, and notes.

## Claude CLI Commands

- `/generate-notes` — Generate JSON session notes from chapter content
- `/novelify` — Convert D&D session transcripts into novel-style chapters
