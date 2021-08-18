import * as logger from "./libraries/logger.js";
import config from "./config.js";
import Discord from "discord.js";
import fs from "fs";

export const commands = new Map();

// Load commands from files
const files = fs.readdirSync("./commands/");
files.forEach(async file => {
    let command = await import("./commands/" + file);
    commands.set(command.name, command);
});

// Our bot client
const client = new Discord.Client({
    intents: [ 
        Discord.Intents.FLAGS.GUILDS,    
        Discord.Intents.FLAGS.GUILD_MESSAGES
    ]
});

// Listen for slash commands
client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;
    commands.get(interaction.commandName)?.execute(interaction);
    logger.send(`${interaction.user.tag} used /${interaction.commandName}`);
});


client.on("ready", async () => {

    await client.application?.fetch();
    client.user.setActivity("with friends");

    logger.setLogsChannel(client.channels.cache.get(config?.logs));
    logger.send(`✔️ Connected in ${client.guilds.cache.size} servers`);

    // const slashCommands = [];
    // commands.forEach(command => {
    //     slashCommands.push({
    //         name: command.name,
    //         description: command.description,
    //         options: command.options || []
    //     });
    // });
    // await client.application?.commands.set(slashCommands);
    // await client.guilds.cache.get("591194478602223617")?.commands.set([]); // charly's server
    // await client.guilds.cache.get("503244758966337546")?.commands.set([]); // dimden.plex
    // await client.guilds.cache.get("802829823911133186")?.commands.set([]); // afterlife
    // await client.guilds.cache.get("321819041348190249")?.commands.set([]); // mpp
    // await client.guilds.cache.get("872273711980511292")?.commands.set([]); // no
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