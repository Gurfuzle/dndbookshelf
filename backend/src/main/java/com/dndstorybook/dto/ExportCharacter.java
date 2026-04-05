package com.dndstorybook.dto;

public record ExportCharacter(
        String name,
        String playerName,
        String raceClass,
        String background,
        String imageUrl
) {}
