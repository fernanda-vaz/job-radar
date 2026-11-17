import "dotenv/config";
import { Client, Events, GatewayIntentBits, MessageFlags } from "discord.js";
import { configurar } from "./commands/configurar.js";
import { filtros } from "./commands/filtros.js";
import { remover } from "./commands/remover.js";
import { startScheduler } from "./scheduler/jobs.js";

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error("DISCORD_TOKEN não configurado.");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, (readyClient) => { console.log(`JobRadar online: ${readyClient.user.tag}`); startScheduler(client); });
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  try {
    if (interaction.commandName === "configurar") await configurar(interaction);
    else if (interaction.commandName === "filtros") await filtros(interaction);
    else if (interaction.commandName === "remover") await remover(interaction);
    else if (interaction.commandName === "status") await interaction.reply({ content: "JobRadar está online!", flags: MessageFlags.Ephemeral });
  } catch (error) {
    console.error("Erro no comando:", error);
    const response = { content: "Não foi possível executar o comando.", flags: MessageFlags.Ephemeral } as const;
    if (interaction.deferred || interaction.replied) await interaction.followUp(response); else await interaction.reply(response);
  }
});
await client.login(token);
