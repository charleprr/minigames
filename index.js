import * as Logger from "./libraries/logger.js";
import config from "./config.js";
import Discord from "discord.js";
import fs from "fs";

// Discord client
const client = new Discord.Client({
    intents: [ Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES ]
});

// Games dictionary
const games = new Map();
const folders = fs.readdirSync("./games/");
folders.forEach(async folder => {
    let game = await import("./games/" + folder + "/index.js");
    games.set(game.name, game);
});

// Deploy an update
async function deploy() {
    await client.application?.commands.set([
        {
            name: "top",
            description: "Are you on the leaderboard?",
            options: [{
                name: "game",
                type: "STRING",
                description: "Which game?",
                required: true,
                choices: Array.from(games.values())
                    .filter(game => game.leaderboard)
                    .map(game => Object({ name: game.name, value: game.name}))
            }]
        },
        {
            name: "ping",
            description: "What's my ping?"
        },
        {
            name: "invite",
            description: "Add me to your server!"
        },
        ...Array.from(games.values()).map(game => Object({
            name: game.name,
            description: game.description,
            options: game.options || []
        }))
    ]);
}

// Listen for slash commands
client.on("interactionCreate", async interaction => {

    if (!interaction.isCommand())
        return;

    switch (interaction.commandName) {
        
        case "top":
            const name = interaction.options.get("game")?.value;
            const leaderboard = games.get(name).leaderboard;
            await interaction.deferReply(); // "Minigames is thinking..."
            await interaction.editReply({ files: [await leaderboard.render(interaction.client)] });
            break;
    
        case "ping":
            interaction.reply("🏓 Pong! (" + interaction.client.ws.ping + "ms)");
            break;

        case "invite":
            interaction.reply("[Click here!](https://discord.com/api/oauth2/authorize?client_id="
                + interaction.client.user.id + "&permissions=0&scope=applications.commands%20bot)");
            break;
            
        default:
            const game = games.get(interaction.commandName);
            game?.execute(interaction);
            // TODO: Find a way to avoid people start
            // more than one game at a time.
    }
    
    Logger.send(`${interaction.user.tag} used /${interaction.commandName}`);
});

client.on("ready", async () => {
    await client.application?.fetch();
    await deploy();
    client.user.setActivity("with friends");
    Logger.setLogsChannel(client.channels.cache.get(config?.logs));
    Logger.send(`✔️ Connected in ${client.guilds.cache.size} servers`);
});

client.on("warn", (warning) =>      Logger.send(`⚠️ ${warning}`));
client.on("error", (error) =>       Logger.send(`❌ ${error}`));
client.on("shardError", (error) =>  Logger.send(`💥 ${error}`));
client.on("shardDisconnect", () =>  Logger.send(`🔌 Disconnected`));
client.on("invalidated", () =>      Logger.send(`⛔ Session invalidated`));
client.on("rateLimit", () =>        Logger.send(`🐌 Rate-limited`));
client.on("guildCreate", (guild) => Logger.send(`➕ Joined '${guild.name}' (${guild.memberCount} members)`));
client.on("guildDelete", (guild) => Logger.send(`➖ Left '${guild.name}' (${guild.memberCount} members)`));

client.login(config?.token);