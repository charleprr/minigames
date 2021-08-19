import * as Logger from "./libraries/logger.js";
import config from "./config.js";
import Discord from "discord.js";
import fs from "fs";

const games = new Map();

// Load games
const files = fs.readdirSync("./games/");
files.forEach(async file => {
    let game = await import("./games/" + file);
    games.set(game.name, game);
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

    if (!interaction.isCommand())
        return;

    switch (interaction.commandName) {

        case "play":
            games.get(interaction.options.getSubcommand())?.execute(interaction);
            break;
        
        case "top":
            const game = interaction.options.get("game")?.value;
            const leaderboard = games.get(game).leaderboard;
            await interaction.deferReply(); // "Minigames is thinking..."
            await interaction.editReply({ files: [await leaderboard.render(interaction.client)] });
            break;
    
        case "ping":
            interaction.reply("🏓 Pong! (" + interaction.client.ws.ping + "ms)");
            break;

        case "invite":
            interaction.reply("[Click here!](https://discord.com/api/oauth2/authorize"
                + interaction.client.user.id + "&permissions=0&scope=applications.commands%20bot)");
            break;
    }
    
    Logger.send(`${interaction.user.tag} used /${interaction.commandName}`);
});

client.on("ready", async () => {
    await client.application?.fetch();
    client.user.setActivity("with friends");
    Logger.setLogsChannel(client.channels.cache.get(config?.logs));
    Logger.send(`✔️ Connected in ${client.guilds.cache.size} servers`);
    // Deploy Slash commands
    // await client.application?.commands.set([
    //     {
    //         name: "play",
    //         description: "Play with your friends!",
    //         options: Array.from(games.values()).map(game => Object({
    //             type: 1,
    //             name: game.name,
    //             description: game.description,
    //             options: game.options || []
    //         }))
    //     },
    //     {
    //         name: "top",
    //         description: "Are you on the leaderboard?",
    //         options: [{
    //             name: "game",
    //             type: "STRING",
    //             description: "Which game?",
    //             required: true,
    //             choices: Array.from(games.values())
    //                 .filter(game => game.leaderboard)
    //                 .map(game => Object({ name: game.name, value: game.name}))
    //         }]
    //     },
    //     {
    //         name: "ping",
    //         description: "What's my ping?"
    //     },
    //     {
    //         name: "invite",
    //         description: "Add me to your server!"
    //     }
    // ]);
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