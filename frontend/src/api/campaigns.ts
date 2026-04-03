import client from './client';
import type { CampaignSummary, ChapterSummary, ChapterContent, CharactersContent, CampaignOverview } from '../types/campaign';

export async function listCampaigns(): Promise<CampaignSummary[]> {
  const { data } = await client.get<CampaignSummary[]>('/campaigns');
  return data;
}

export async function listChapters(slug: string): Promise<ChapterSummary[]> {
  const { data } = await client.get<ChapterSummary[]>(`/campaigns/${slug}/chapters`);
  return data;
}

export async function getChapter(slug: string, filename: string): Promise<ChapterContent> {
  const { data } = await client.get<ChapterContent>(`/campaigns/${slug}/chapters/${filename}`);
  return data;
}

export async function getCharacters(slug: string): Promise<CharactersContent> {
  const { data } = await client.get<CharactersContent>(`/campaigns/${slug}/characters`);
  return data;
}

export async function getOverview(slug: string): Promise<CampaignOverview> {
  const { data } = await client.get<CampaignOverview>(`/campaigns/${slug}/overview`);
  return data;
}
