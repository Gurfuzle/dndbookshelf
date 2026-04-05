package com.dndstorybook.dto;

import java.util.List;
import java.util.Map;

public record ChapterNotes(
        String chapterFilename,
        String chapterTitle,
        String sessionDate,
        String summary,
        List<String> charactersPresent,
        List<String> npcsPresent,
        List<String> notableEvents,
        List<String> items,
        String cliffhanger,
        Map<String, CharacterNote> characterNotes,
        DmNotes dmNotes
) {}
