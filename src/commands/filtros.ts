import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { prisma } from "../lib/prisma.js";

export async function filtros(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.inCachedGuild()) return;
  const channel = interaction.options.getChannel("canal", true);
  const config = await prisma.channelConfig.findFirst({ where: { channelId: channel.id, guildId: interaction.guildId } });
  if (!config) {
    await interaction.reply({ content: "Canal não configurado.", flags: MessageFlags.Ephemeral });
    return;
  }
  const show = (values: string[]) => values.length ? values.join(", ") : "Qualquer";
  await interaction.reply({
    content: [
      `Filtros de <#${channel.id}>`, `Cargos: ${show(config.titles)}`, `Tecnologias: ${show(config.technologies)}`,
      `Localizações: ${show(config.locations)}`, `Experiência: ${config.minYears ?? "qualquer"}–${config.maxYears ?? "qualquer"}`,
      `Remoto: ${config.remoteOnly ? "Sim" : "Não obrigatório"}`, `Exclusões: ${show(config.excluded)}`,
      `Ativo: ${config.enabled ? "Sim" : "Não"}`,
    ].join("\n"), flags: MessageFlags.Ephemeral, allowedMentions: { parse: [] },
  });
}
