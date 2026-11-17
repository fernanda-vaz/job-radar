import { z } from "zod";
import type { NormalizedJob } from "./types.js";

const responseSchema = z.object({
  results: z.array(z.object({
    id: z.union([z.string(), z.number()]),
    title: z.string(),
    company: z.object({ display_name: z.string().optional() }).optional(),
    redirect_url: z.string().url(),
    description: z.string().optional(),
    location: z.object({ display_name: z.string().optional() }).optional(),
    created: z.string().optional(),
  })),
});

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function isExplicitlyRemote(title: string, description: string): boolean {
  return /\b(remote|remoto|home\s*office|teletrabalho|trabalho remoto)\b/i.test(`${title} ${description}`);
}

export async function collectAdzunaJobs(fetchImpl: typeof fetch = fetch): Promise<NormalizedJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  const queries = (process.env.ADZUNA_QUERIES ?? "developer,desenvolvedor")
    .split(",").map((query) => query.trim()).filter(Boolean);
  const jobs = new Map<string, NormalizedJob>();

  for (const query of queries) {
    const url = new URL("https://api.adzuna.com/v1/api/jobs/br/search/1");
    url.searchParams.set("app_id", appId);
    url.searchParams.set("app_key", appKey);
    url.searchParams.set("results_per_page", process.env.ADZUNA_RESULTS_PER_PAGE ?? "50");
    url.searchParams.set("what", query);
    url.searchParams.set("content-type", "application/json");
    const response = await fetchImpl(url);
    if (!response.ok) throw new Error(`Adzuna HTTP ${response.status}`);
    const parsed = responseSchema.parse(await response.json());

    for (const job of parsed.results) {
      const description = stripHtml(job.description ?? "");
      const publishedAt = job.created ? new Date(job.created) : null;
      jobs.set(String(job.id), {
        source: "adzuna-br",
        externalId: String(job.id),
        title: job.title.trim(),
        company: job.company?.display_name?.trim() || "Empresa não informada",
        url: job.redirect_url,
        description,
        location: job.location?.display_name?.trim() || null,
        remote: isExplicitlyRemote(job.title, description),
        technologies: [],
        eligibleLocations: job.location?.display_name ? [job.location.display_name] : [],
        minYears: null,
        maxYears: null,
        publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null,
      });
    }
  }
  return [...jobs.values()];
}
