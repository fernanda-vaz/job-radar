import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits } from "discord.js";
import { prisma } from "../lib/prisma.js";
import { filterSchema } from "../filters/schema.js";
import { parseList } from "./utils.js";

export async function configurar(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.inCachedGuild()) return;
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
    await interaction.reply({ content: "Permissão insuficiente.", flags: MessageFlags.Ephemeral });
    return;
  }

  const channel = interaction.options.getChannel("canal", true);
  if (!channel.isTextBased() || channel.guildId !== interaction.guildId) {
    await interaction.reply({ content: "Escolha um canal de texto deste servidor.", flags: MessageFlags.Ephemeral });
    return;
  }

  const parsed = filterSchema.safeParse({
    titles: parseList(interaction.options.getString("cargos")),
    technologies: parseList(interaction.options.getString("tecnologias")),
    locations: parseList(interaction.options.getString("localizacoes")),
    excluded: parseList(interaction.options.getString("excluir")),
    remoteOnly: interaction.options.getBoolean("remoto") ?? true,
    minYears: interaction.options.getInteger("experiencia_min"),
    maxYears: interaction.options.getInteger("experiencia_max"),
  });

  if (!parsed.success) {
    await interaction.reply({ content: "Configuração inválida: verifique a faixa de experiência e os termos.", flags: MessageFlags.Ephemeral });
    return;
  }

  await prisma.channelConfig.upsert({
    where: { channelId: channel.id },
    create: { guildId: interaction.guildId, channelId: channel.id, ...parsed.data },
    update: { guildId: interaction.guildId, ...parsed.data, enabled: true },
  });
  await interaction.reply({ content: `Filtros configurados em <#${channel.id}>.`, flags: MessageFlags.Ephemeral });
}
