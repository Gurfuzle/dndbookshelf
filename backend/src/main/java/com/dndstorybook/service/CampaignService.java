package com.dndstorybook.service;

import com.dndstorybook.dto.*;
import com.dndstorybook.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CampaignService {

    private static final Pattern SLUG_PATTERN = Pattern.compile("^[a-z0-9-]+$");
    private static final Pattern FILENAME_PATTERN = Pattern.compile("^[a-z0-9-]+\\.md$");
    private static final Pattern TITLE_PATTERN = Pattern.compile("^#\\s+(.+)$", Pattern.MULTILINE);
    private static final Pattern DATE_PATTERN = Pattern.compile("\\*Session played (.+?)\\*");
    private static final Pattern CHARACTER_HEADING = Pattern.compile("^### (.+)$", Pattern.MULTILINE);
    private static final Pattern RACE_CLASS_PATTERN = Pattern.compile("\\*\\*Race/Class\\*\\*:\\s*(.+)");
    private static final Pattern BACKGROUND_PATTERN = Pattern.compile("\\*\\*Background\\*\\*:\\s*(.+)");
    private static final Pattern FRONTMATTER_PATTERN = Pattern.compile("^---\\s*\\n(.*?)\\n---", Pattern.DOTALL);

    private final Path campaignsPath;
    private final String bookshelfUrl;
    private final String rpgdashboardUrl;
    private final ObjectMapper objectMapper;

    public CampaignService(@Value("${app.campaigns-path}") String campaignsPath,
                           @Value("${app.bookshelf-url}") String bookshelfUrl,
                           @Value("${app.rpgdashboard-url:}") String rpgdashboardUrl) {
        this.campaignsPath = Paths.get(campaignsPath).toAbsolutePath().normalize();
        this.bookshelfUrl = bookshelfUrl;
        this.rpgdashboardUrl = rpgdashboardUrl;
        this.objectMapper = new ObjectMapper();
    }

    public List<CampaignSummary> listCampaigns() {
        List<CampaignSummary> campaigns = new ArrayList<>();

        try (DirectoryStream<Path> stream = Files.newDirectoryStream(campaignsPath)) {
            for (Path entry : stream) {
                if (!Files.isDirectory(entry)) continue;
                String slug = entry.getFileName().toString();
                if (!SLUG_PATTERN.matcher(slug).matches()) continue;

                String title = formatTitle(slug);
                int chapterCount = countChapters(entry);
                campaigns.add(new CampaignSummary(slug, title, 0, chapterCount));
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to read campaigns directory", e);
        }

        campaigns.sort(Comparator.comparing(CampaignSummary::slug));

        // Assign bookIndex by alphabetical order
        List<CampaignSummary> indexed = new ArrayList<>();
        for (int i = 0; i < campaigns.size(); i++) {
            CampaignSummary c = campaigns.get(i);
            indexed.add(new CampaignSummary(c.slug(), c.title(), i, c.chapterCount()));
        }
        return indexed;
    }

    public List<ChapterSummary> listChapters(String slug) {
        validateSlug(slug);
        Path chaptersDir = campaignsPath.resolve(slug).resolve("chapters");
        if (!Files.isDirectory(chaptersDir)) {
            throw new ResourceNotFoundException("Campaign not found: " + slug);
        }

        List<ChapterSummary> chapters = new ArrayList<>();

        try (DirectoryStream<Path> stream = Files.newDirectoryStream(chaptersDir, "*.md")) {
            for (Path file : stream) {
                String filename = file.getFileName().toString();
                String content = Files.readString(file);
                String title = extractTitle(content);
                String date = extractDate(content);
                int sortOrder = parseSortOrder(filename);
                chapters.add(new ChapterSummary(filename, title, date, sortOrder));
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to read chapters for: " + slug, e);
        }

        chapters.sort(Comparator.comparingInt(ChapterSummary::sortOrder));
        return chapters;
    }

    public ChapterContent getChapter(String slug, String filename) {
        validateSlug(slug);
        validateFilename(filename);
        Path file = campaignsPath.resolve(slug).resolve("chapters").resolve(filename);
        if (!Files.isRegularFile(file)) {
            throw new ResourceNotFoundException("Chapter not found: " + filename);
        }

        try {
            String content = Files.readString(file);
            String title = extractTitle(content);
            String date = extractDate(content);
            return new ChapterContent(filename, title, content, date);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read chapter: " + filename, e);
        }
    }

    public CharactersContent getCharacters(String slug) {
        validateSlug(slug);
        Path file = campaignsPath.resolve(slug).resolve("characters.md");
        if (!Files.isRegularFile(file)) {
            throw new ResourceNotFoundException("Characters file not found for: " + slug);
        }

        try {
            return new CharactersContent(Files.readString(file));
        } catch (IOException e) {
            throw new RuntimeException("Failed to read characters for: " + slug, e);
        }
    }

    public List<ExportCharacter> parseCharacters(String slug) {
        validateSlug(slug);
        Path file = campaignsPath.resolve(slug).resolve("characters.md");
        if (!Files.isRegularFile(file)) {
            return List.of();
        }

        try {
            String content = Files.readString(file);
            // Only parse the Player Characters section
            int pcStart = content.indexOf("## Player Characters");
            if (pcStart < 0) return List.of();

            // Find end of PC section (next ## heading or end of file)
            int pcEnd = content.indexOf("\n## ", pcStart + 1);
            if (pcEnd < 0) pcEnd = content.length();
            String pcSection = content.substring(pcStart, pcEnd);

            List<ExportCharacter> characters = new ArrayList<>();
            Matcher headingMatcher = CHARACTER_HEADING.matcher(pcSection);

            while (headingMatcher.find()) {
                String name = headingMatcher.group(1).trim();
                // Strip parenthetical nicknames: "Kaiya Gemflower (called "Kaiya Lightspear")" -> "Kaiya Gemflower"
                int parenIdx = name.indexOf('(');
                if (parenIdx > 0) {
                    name = name.substring(0, parenIdx).trim();
                }

                // Find the block of text for this character (until next ### or end)
                int blockStart = headingMatcher.end();
                int blockEnd = pcSection.indexOf("\n### ", blockStart);
                if (blockEnd < 0) blockEnd = pcSection.length();
                String block = pcSection.substring(blockStart, blockEnd);

                String raceClass = extractField(block, RACE_CLASS_PATTERN);
                String background = extractField(block, BACKGROUND_PATTERN);

                characters.add(new ExportCharacter(name, "Unknown", raceClass, background));
            }

            return characters;
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse characters for: " + slug, e);
        }
    }

    public ChapterNotes readNotes(String slug, String chapterFilename) {
        validateSlug(slug);
        String notesName = chapterFilename.replace(".md", ".json");
        Path notesFile = campaignsPath.resolve(slug).resolve("notes").resolve(notesName);
        if (!Files.isRegularFile(notesFile)) {
            return null;
        }

        try {
            return objectMapper.readValue(notesFile.toFile(), ChapterNotes.class);
        } catch (IOException e) {
            return null;
        }
    }

    public CampaignExport buildExport(String slug) {
        validateSlug(slug);
        Path campaignDir = campaignsPath.resolve(slug);
        if (!Files.isDirectory(campaignDir)) {
            throw new ResourceNotFoundException("Campaign not found: " + slug);
        }

        String title = formatTitle(slug);
        List<ExportCharacter> characters = parseCharacters(slug);
        List<ChapterSummary> chapters = listChapters(slug);

        // Read overview for description
        String description = "";
        CampaignOverview overview = getOverview(slug);
        if (overview != null) {
            description = overview.description() != null ? overview.description() : "";
        }

        List<ExportSession> sessions = new ArrayList<>();
        for (ChapterSummary ch : chapters) {
            ChapterNotes notes = readNotes(slug, ch.filename());
            sessions.add(new ExportSession(ch.filename(), ch.title(), ch.sessionDate(), notes));
        }

        String campaignUrl = bookshelfUrl + "/campaign/" + slug;
        return new CampaignExport(slug, title, description, "Tyranny of Dragons", campaignUrl, characters, sessions);
    }

    public CampaignOverview getOverview(String slug) {
        validateSlug(slug);
        Path overviewFile = campaignsPath.resolve(slug).resolve("overview.md");
        if (!Files.isRegularFile(overviewFile)) {
            return new CampaignOverview(slug, formatTitle(slug), "", null);
        }

        try {
            String content = Files.readString(overviewFile);
            String rpgdashboardId = null;

            // Parse YAML frontmatter for rpgdashboard-id
            Matcher fm = FRONTMATTER_PATTERN.matcher(content);
            String body = content;
            if (fm.find()) {
                String frontmatter = fm.group(1);
                for (String line : frontmatter.split("\n")) {
                    line = line.trim();
                    if (line.startsWith("rpgdashboard-id:")) {
                        rpgdashboardId = line.substring("rpgdashboard-id:".length()).trim();
                    }
                }
                body = content.substring(fm.end()).trim();
            }

            String rpgUrl = rpgdashboardId != null
                    ? rpgdashboardUrl + "/campaigns/" + rpgdashboardId
                    : null;

            return new CampaignOverview(slug, formatTitle(slug), body, rpgUrl);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read overview for: " + slug, e);
        }
    }

    public void updateOverview(String slug, OverviewUpdateRequest request) {
        validateSlug(slug);
        Path overviewFile = campaignsPath.resolve(slug).resolve("overview.md");

        StringBuilder sb = new StringBuilder();
        if (request.rpgdashboardId() != null) {
            sb.append("---\n");
            sb.append("rpgdashboard-id: ").append(request.rpgdashboardId()).append("\n");
            sb.append("---\n\n");
        }
        if (request.description() != null) {
            sb.append(request.description());
        } else {
            // Preserve existing description if only updating rpgdashboard-id
            CampaignOverview existing = getOverview(slug);
            if (existing != null && existing.description() != null) {
                sb.append(existing.description());
            }
        }

        try {
            Files.writeString(overviewFile, sb.toString());
        } catch (IOException e) {
            throw new RuntimeException("Failed to write overview for: " + slug, e);
        }
    }

    private void validateSlug(String slug) {
        if (slug == null || !SLUG_PATTERN.matcher(slug).matches()) {
            throw new IllegalArgumentException("Invalid campaign slug: " + slug);
        }
    }

    private void validateFilename(String filename) {
        if (filename == null || !FILENAME_PATTERN.matcher(filename).matches()) {
            throw new IllegalArgumentException("Invalid filename: " + filename);
        }
    }

    private String extractTitle(String content) {
        Matcher m = TITLE_PATTERN.matcher(content);
        return m.find() ? m.group(1).trim() : "Untitled";
    }

    private String extractDate(String content) {
        Matcher m = DATE_PATTERN.matcher(content);
        return m.find() ? m.group(1).trim() : null;
    }

    private String extractField(String block, Pattern pattern) {
        Matcher m = pattern.matcher(block);
        return m.find() ? m.group(1).trim() : "";
    }

    private int parseSortOrder(String filename) {
        if (filename.startsWith("preface")) return 0;
        // Extract number from patterns like "chapter-01-..." or "chapter-10-..."
        Matcher m = Pattern.compile("chapter-(\\d+)").matcher(filename);
        if (m.find()) return Integer.parseInt(m.group(1));
        return 999;
    }

    private int countChapters(Path campaignDir) {
        Path chaptersDir = campaignDir.resolve("chapters");
        if (!Files.isDirectory(chaptersDir)) return 0;
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(chaptersDir, "*.md")) {
            int count = 0;
            for (@SuppressWarnings("unused") Path ignored : stream) count++;
            return count;
        } catch (IOException e) {
            return 0;
        }
    }

    private String formatTitle(String slug) {
        // "tyranny-of-dragons" -> "Tyranny of Dragons"
        String[] words = slug.split("-");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < words.length; i++) {
            if (i > 0) sb.append(" ");
            String word = words[i];
            if (word.length() <= 3 && i > 0 && i < words.length - 1
                    && (word.equals("of") || word.equals("the") || word.equals("and")
                        || word.equals("in") || word.equals("on") || word.equals("at"))) {
                sb.append(word);
            } else {
                sb.append(Character.toUpperCase(word.charAt(0))).append(word.substring(1));
            }
        }
        return sb.toString();
    }
}
