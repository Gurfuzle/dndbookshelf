package com.dndstorybook.dto;

public record ExportSession(
        String chapterFilename,
        String title,
        String sessionDate,
        ChapterNotes notes
) {}
