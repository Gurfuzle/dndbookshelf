package com.dndstorybook.dto;

public record ChapterSummary(
        String filename,
        String title,
        String sessionDate,
        int sortOrder
) {}
