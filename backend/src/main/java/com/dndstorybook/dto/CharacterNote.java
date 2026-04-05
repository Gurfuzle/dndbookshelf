package com.dndstorybook.dto;

import java.util.List;

public record CharacterNote(
        String characterName,
        String summary,
        List<String> keyActions,
        List<String> characterDevelopment,
        List<String> itemChanges,
        List<String> relationshipChanges,
        List<String> privateKnowledge
) {}
