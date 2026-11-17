import { XMLParser } from "fast-xml-parser";
import type { NormalizedJob } from "./types.js";

type FeedItem = Record<string, unknown>;

function first(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return first(value[0]);
  if (value && typeof value === "object" && "#text" in value) return first(value["#text"]);
  return undefined;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function asItems(parsed: Record<string, unknown>): FeedItem[] {
  const rss = parsed.rss as Record<string, unknown> | undefined;
  const channel = rss?.channel as Record<string, unknown> | undefined;
  const atom = parsed.feed as Record<string, unknown> | undefined;
  const items = channel?.item ?? atom?.entry ?? [];
  return (Array.isArray(items) ? items : [items]).filter(Boolean) as FeedItem[];
}

function linkFrom(item: FeedItem): string | undefined {
  const direct = first(item.link);
  if (direct) return direct;
  if (item.link && typeof item.link === "object" && "@_href" in item.link) return String(item.link["@_href"]);
  return undefined;
}

export async function collectConfiguredRssJobs(fetchImpl: typeof fetch = fetch): Promise<NormalizedJob[]> {
  const feeds = (process.env.JOBRADAR_RSS_URLS ?? "").split(",").map((url) => url.trim()).filter(Boolean);
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const jobs: NormalizedJob[] = [];

  for (const feedUrl of feeds) {
    const response = await fetchImpl(feedUrl);
    if (!response.ok) throw new Error(`RSS HTTP ${response.status}: ${feedUrl}`);
    const parsed = parser.parse(await response.text()) as Record<string, unknown>;
    const source = `rss:${new URL(feedUrl).hostname}`;
    for (const item of asItems(parsed)) {
      const title = first(item.title)?.trim();
      const url = linkFrom(item)?.trim();
      if (!title || !url) continue;
      const description = stripHtml(first(item.description) ?? first(item.summary) ?? "");
      const published = first(item.pubDate) ?? first(item.published) ?? first(item.updated);
      const publishedAt = published ? new Date(published) : null;
      jobs.push({
        source,
        externalId: url,
        title,
        company: first(item.company) ?? first(item.author) ?? "Empresa não informada",
        url,
        description,
        location: first(item.location) ?? null,
        remote: /\b(remote|remoto|home\s*office|teletrabalho|trabalho remoto)\b/i.test(`${title} ${description}`),
        technologies: [],
        eligibleLocations: first(item.location) ? [first(item.location)!] : [],
        minYears: null,
        maxYears: null,
        publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null,
      });
    }
  }
  return jobs;
}
