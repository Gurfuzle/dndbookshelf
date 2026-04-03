package com.dndstorybook.dto;

public record CampaignSummary(
        String slug,
        String title,
        int bookIndex,
        int chapterCount
) {}
