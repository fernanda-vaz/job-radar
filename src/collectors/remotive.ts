import { z } from "zod";
import type { NormalizedJob } from "./types.js";

const responseSchema = z.object({
  jobs: z.array(z.object({
    id: z.number(),
    title: z.string(),
    company_name: z.string(),
    url: z.string().url(),
    description: z.string().default(""),
    candidate_required_location: z.string().optional(),
    publication_date: z.string().optional(),
  })),
});

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function collectRemotiveJobs(
  fetchImpl: typeof fetch = fetch,
): Promise<NormalizedJob[]> {
  const response = await fetchImpl("https://remotive.com/api/remote-jobs?category=software-dev");
  if (!response.ok) throw new Error(`Remotive HTTP ${response.status}`);

  const parsed = responseSchema.parse(await response.json());
  return parsed.jobs.map((job) => {
    const date = job.publication_date ? new Date(job.publication_date) : null;
    return {
      source: "remotive",
      externalId: String(job.id),
      title: job.title.trim(),
      company: job.company_name.trim(),
      url: job.url,
      description: stripHtml(job.description),
      location: job.candidate_required_location?.trim() || null,
      remote: true,
      technologies: [],
      eligibleLocations: job.candidate_required_location ? [job.candidate_required_location] : [],
      minYears: null,
      maxYears: null,
      publishedAt: date && !Number.isNaN(date.getTime()) ? date : null,
    };
  });
}
