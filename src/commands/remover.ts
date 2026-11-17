import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits } from "discord.js";
import { prisma } from "../lib/prisma.js";

export async function remover(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.inCachedGuild()) return;
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
    await interaction.reply({ content: "Permissão insuficiente.", flags: MessageFlags.Ephemeral });
    return;
  }
  const channel = interaction.options.getChannel("canal", true);
  const result = await prisma.channelConfig.updateMany({ where: { channelId: channel.id, guildId: interaction.guildId }, data: { enabled: false } });
  await interaction.reply({ content: result.count ? "Notificações desativadas." : "Canal não configurado.", flags: MessageFlags.Ephemeral });
}
