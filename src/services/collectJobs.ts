import type { Client } from "discord.js";
import { prisma } from "../lib/prisma.js";
import { collectAllJobs } from "../collectors/index.js";
import { notifyChannels } from "./notifier.js";

export async function collectJobs(client: Client): Promise<number> {
  const jobs = await collectAllJobs();
  for (const job of jobs) {
    const saved = await prisma.job.upsert({
      where: { source_externalId: { source: job.source, externalId: job.externalId } },
      create: job,
      update: { ...job },
    });
    await notifyChannels(client, saved.id);
  }
  console.log(`Vagas processadas: ${jobs.length}`);
  return jobs.length;
}
