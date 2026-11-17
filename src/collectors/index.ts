import type { Client } from "discord.js";
import { collectAdzunaJobs } from "./adzuna.js";
import { collectRemotiveJobs } from "./remotive.js";
import { collectConfiguredRssJobs } from "./rss.js";
import type { NormalizedJob } from "./types.js";

export async function collectAllJobs(): Promise<NormalizedJob[]> {
  const results = await Promise.allSettled([collectRemotiveJobs(), collectAdzunaJobs(), collectConfiguredRssJobs()]);
  const jobs: NormalizedJob[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") jobs.push(...result.value);
    else console.error("Falha em uma fonte de vagas:", result.reason);
  }
  return [...new Map(jobs.map((job) => [`${job.source}:${job.externalId}`, job])).values()];
}

export type { Client };
