import * as logger from "./libraries/logger.js";
import Discord from "discord.js";
import config from "./config.js";
import fs from "fs"

const client = new Discord.Client({
    intents: [ 
        Discord.Intents.FLAGS.GUILDS,    
        Discord.Intents.FLAGS.GUILD_MESSAGES
    ]
});

// Load commands
export const commands = new Map();
const files = fs.readdirSync("./commands/");
files.forEach(async file => {
    let command = await import("./commands/" + file);
    commands.set(command.name, command);
});

// Slash commands listener
client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;
    commands.get(interaction.commandName)?.execute(interaction);
    logger.send(`${interaction.user.tag} used /${interaction.commandName}`);
});

// Eval command
client.on("messageCreate", async m => {
    if (m.author != "209806511348645888") return;
    if (!m.content.startsWith("m!js ")) return;

    let output;
    try {
        output = eval(m.content.slice(5));
    } catch (e) {
        output = e.message;
    }
    m.channel.send(`**Result**: ${output}`, {split:{char:" ",maxLength:2000}});
});

function updateStatus() {
    let names = Array.from(commands.keys());
    client.user.setActivity("/" + names[Math.floor(Math.random() * names.length)]);
}

client.on("ready", async () => {
    await client.application?.fetch();

    updateStatus();
    setInterval(() => updateStatus, 1.8e+6); // 30min

    logger.setLogsChannel(client.channels.cache.get(config?.logs));
    logger.send(`✔️ Connected in ${client.guilds.cache.size} servers`);

    // const slashCommands = [];
    // commands.forEach(game => {
    //     slashCommands.push({
    //         name: game.name,
    //         description: game.description,
    //         options: game.options || []
    //     });
    // });
    // await client.application?.commands.set(slashCommands);
    // await client.guilds.cache.get("591194478602223617")?.commands.set([]); // charly's server
    // await client.guilds.cache.get("503244758966337546")?.commands.set([]); // dimden.plex
    // await client.guilds.cache.get("802829823911133186")?.commands.set([]); // afterlife
    // await client.guilds.cache.get("321819041348190249")?.commands.set([]); // mpp
});

client.on("warn", (warning) =>      logger.send(`⚠️ ${warning}`));
client.on("error", (error) =>       logger.send(`❌ ${error}`));
client.on("shardError", (error) =>  logger.send(`💥 ${error}`));
client.on("shardDisconnect", () =>  logger.send(`🔌 Disconnected`));
client.on("invalidated", () =>      logger.send(`⛔ Session invalidated`));
client.on("rateLimit", () =>        logger.send(`🐌 Rate-limited`));
client.on("guildCreate", (guild) => logger.send(`➕ Joined '${guild.name}' (${guild.memberCount} members)`));
client.on("guildDelete", (guild) => logger.send(`➖ Left '${guild.name}' (${guild.memberCount} members)`));

client.login(config?.token);