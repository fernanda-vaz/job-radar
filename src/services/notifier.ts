import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { prisma } from "../lib/prisma.js";
import { matchesJob } from "../filters/matcher.js";

export async function notifyChannels(client: Client, jobId: string): Promise<void> {
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
  const configs = await prisma.channelConfig.findMany({ where: { enabled: true } });
  for (const config of configs) {
    const compatible = matchesJob(job, {
      titles: config.titles, technologies: config.technologies, locations: config.locations,
      excluded: config.excluded, remoteOnly: config.remoteOnly, minYears: config.minYears, maxYears: config.maxYears,
    });
    if (!compatible) continue;
    const notification = await prisma.notification.upsert({ where: { jobId_configId: { jobId, configId: config.id } }, create: { jobId, configId: config.id }, update: {} });
    if (notification.status === "SENT") continue;
    try {
      const channel = await client.channels.fetch(config.channelId);
      if (!(channel instanceof TextChannel)) continue;
      const embed = new EmbedBuilder().setTitle(job.title.slice(0, 256)).setURL(job.url).setColor(0x5865f2)
        .addFields({ name: "Empresa", value: job.company.slice(0, 1024) }, { name: "Localização", value: job.location ?? "Não informada" })
        .setDescription(job.description.slice(0, 350) || "Confira os detalhes da vaga.").setFooter({ text: "JobRadar" });
      await channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
      await prisma.notification.update({ where: { id: notification.id }, data: { status: "SENT", sentAt: new Date(), lastError: null } });
    } catch (error) {
      const lastError = error instanceof Error ? error.message.slice(0, 500) : "Erro desconhecido";
      await prisma.notification.update({ where: { id: notification.id }, data: { status: "FAILED", lastError } }).catch(() => undefined);
      console.error("Erro ao notificar canal", { channelId: config.channelId, error: lastError });
    }
  }
}
