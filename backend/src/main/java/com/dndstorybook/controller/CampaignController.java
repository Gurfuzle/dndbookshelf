package com.dndstorybook.controller;

import com.dndstorybook.dto.*;
import com.dndstorybook.service.CampaignService;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {

    private final CampaignService campaignService;

    public CampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @GetMapping
    public List<CampaignSummary> listCampaigns() {
        return campaignService.listCampaigns();
    }

    @GetMapping("/{slug}/chapters")
    public List<ChapterSummary> listChapters(@PathVariable String slug) {
        return campaignService.listChapters(slug);
    }

    @GetMapping("/{slug}/chapters/{filename}")
    public ChapterContent getChapter(@PathVariable String slug, @PathVariable String filename) {
        return campaignService.getChapter(slug, filename);
    }

    @GetMapping("/{slug}/characters")
    public CharactersContent getCharacters(@PathVariable String slug) {
        return campaignService.getCharacters(slug);
    }

    @GetMapping("/{slug}/export")
    public CampaignExport exportCampaign(@PathVariable String slug) {
        return campaignService.buildExport(slug);
    }

    @GetMapping("/{slug}/overview")
    public CampaignOverview getOverview(@PathVariable String slug) {
        return campaignService.getOverview(slug);
    }

    @PostMapping("/{slug}/overview")
    public CampaignOverview updateOverview(@PathVariable String slug, @RequestBody OverviewUpdateRequest request) {
        campaignService.updateOverview(slug, request);
        return campaignService.getOverview(slug);
    }

    @GetMapping("/{slug}/images/characters/{filename}")
    public ResponseEntity<Resource> getCharacterImage(@PathVariable String slug, @PathVariable String filename) {
        return campaignService.getCharacterImage(slug, filename);
    }

    @GetMapping("/{slug}/images/chapters/{filename}")
    public ResponseEntity<Resource> getChapterImage(@PathVariable String slug, @PathVariable String filename) {
        return campaignService.getChapterImage(slug, filename);
    }
}
