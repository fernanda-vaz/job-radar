import "dotenv/config";
import { REST, Routes, SlashCommandBuilder, ChannelType, PermissionFlagsBits } from "discord.js";

const channel = (required = true) => (option: any) => option.setName("canal").setDescription("Canal de notificações").addChannelTypes(ChannelType.GuildText).setRequired(required);
const configurar = new SlashCommandBuilder().setName("configurar").setDescription("Configura filtros de vagas").setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addChannelOption(channel()).addStringOption((o) => o.setName("cargos").setDescription("Cargos separados por vírgula"))
  .addStringOption((o) => o.setName("tecnologias").setDescription("Tecnologias separadas por vírgula"))
  .addStringOption((o) => o.setName("localizacoes").setDescription("Países ou regiões"))
  .addIntegerOption((o) => o.setName("experiencia_min").setDescription("Experiência mínima").setMinValue(0).setMaxValue(50))
  .addIntegerOption((o) => o.setName("experiencia_max").setDescription("Experiência máxima").setMinValue(0).setMaxValue(50))
  .addBooleanOption((o) => o.setName("remoto").setDescription("Somente remoto?"))
  .addStringOption((o) => o.setName("excluir").setDescription("Palavras excluídas"));
const filtros = new SlashCommandBuilder().setName("filtros").setDescription("Mostra filtros do canal").addChannelOption(channel());
const remover = new SlashCommandBuilder().setName("remover").setDescription("Desativa notificações").setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).addChannelOption(channel());
const status = new SlashCommandBuilder().setName("status").setDescription("Verifica o status do bot");

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;
if (!token || !clientId || !guildId) throw new Error("Configure DISCORD_TOKEN, DISCORD_CLIENT_ID e DISCORD_GUILD_ID.");
await new REST({ version: "10" }).setToken(token).put(Routes.applicationGuildCommands(clientId, guildId), { body: [configurar, filtros, remover, status].map((command) => command.toJSON()) });
console.log("Comandos registrados.");
