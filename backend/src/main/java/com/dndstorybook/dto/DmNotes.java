package com.dndstorybook.dto;

import java.util.List;

public record DmNotes(
        List<String> whatWorkedWell,
        List<String> whatDidntWork,
        List<String> playerEngagement,
        List<String> plotHooksPlanted,
        List<String> rulesNotes,
        List<String> rememberNextSession
) {}
