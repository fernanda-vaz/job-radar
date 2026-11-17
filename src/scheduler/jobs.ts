import cron from "node-cron";
import type { Client } from "discord.js";
import { collectJobs } from "../services/collectJobs.js";

let running = false;
export function startScheduler(client: Client): void {
  cron.schedule("0 * * * *", async () => {
    if (running) return;
    running = true;
    try { await collectJobs(client); } catch (error) { console.error("Erro na coleta:", error); } finally { running = false; }
  });
}
