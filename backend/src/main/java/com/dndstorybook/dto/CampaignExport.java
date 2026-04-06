package com.dndstorybook.dto;

import java.util.List;

public record CampaignExport(
        String slug,
        String title,
        String description,
        String sourceBook,
        String bookshelfUrl,
        List<ExportCharacter> characters,
        List<ExportSession> sessions,
        java.util.Map<String, Object> campaignOverview
) {}
