export interface CampaignSummary {
  slug: string;
  title: string;
  bookIndex: number;
  chapterCount: number;
}

export interface ChapterSummary {
  filename: string;
  title: string;
  sessionDate: string | null;
  sortOrder: number;
}

export interface ChapterContent {
  filename: string;
  title: string;
  content: string;
  sessionDate: string | null;
}

export interface CharactersContent {
  content: string;
}

export interface CampaignOverview {
  slug: string;
  title: string;
  description: string;
  rpgdashboardUrl: string | null;
}
