import Discord from "discord.js";
import config from "./config.js";
import fs from "fs"

const client = new Discord.Client({
    intents: [ 
        Discord.Intents.FLAGS.GUILDS,    
        Discord.Intents.FLAGS.GUILD_MESSAGES
    ]
});

// Load games
const games = new Map();
const files = fs.readdirSync("./games");
files.forEach(async file => {
    let game = await import("./games/" + file);
    games.set(game.name, game);
});

// Interactions
client.on("interactionCreate", async interaction => {
    const command = interaction.commandName || interaction.values[0] || interaction.customId;
    switch (command) {
        // How to use Minigames
        case "help":
            const selectMenu = new Discord.MessageSelectMenu();
            selectMenu.setCustomId("games");
            selectMenu.addOptions(
                Array.from(games.values()).map(game => Object({
                    name: "/" + game.name,
                    description: game.description,
                    emoji: game.emoji,
                    value: game.name
                }))
            );
            const actionRow = new Discord.MessageActionRow().addComponents(selectMenu);
            interaction.reply({ content: "Select a game", components: [actionRow]});
            break;

        // Leaderboards
        case "top":
            let name = interaction.options.get("game")?.value;
            let leaderboard = games.get(name).leaderboard;

            await interaction.deferReply();
            await interaction.editReply({files: [ await leaderboard.render() ]});

            break;
        
        // Games
        default:
            games.get(command)?.execute(interaction);
    }
});


async function deploy() {

    const commands = [
        {
            name: "help",
            description: "How to use Minigames"
        },
        {
            name: "top",
            description: "Shows the current leaderboard for a game",
            options: [{
                name: "game",
                type: "STRING",
                description: "Which game?",
                required: true,
                choices: Array.from(games.values())
                    .filter(game => game.leaderboard)
                    .map(game => Object({ name: game.name, value: game.name}))
            }]
        }
    ];

    games.forEach(game => {
        commands.push({
            "name": game.name,
            "description": game.description
        });
    });

    // await client.application?.commands.set(commands);
    // await client.guilds.cache.get("503244758966337546")?.commands.set([]);
}


client.on("ready", async () => {
    await deploy(); // Update Slash Commands
    client.user.setActivity("around");
    console.log("Connected!");
});

client.login(config.token);