import Discord from "discord.js";
import config from "./config.js";
import fs from "fs"

const client = new Discord.Client({
    intents: [ 
        Discord.Intents.FLAGS.GUILDS,    
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
    ]
});

// Load games
const games = new Map();
const files = fs.readdirSync("./games/");
files.forEach(async file => {
    let game = await import("./games/" + file);
    games.set(game.name, game);
});

// Interactions
client.on("interactionCreate", async interaction => {
    const command = interaction.commandName || interaction.values?.[0] || interaction.customId;
    switch (command) {

        // Leaderboards
        case "top":
            let name = interaction.options.get("game")?.value;
            let leaderboard = games.get(name).leaderboard;
            await interaction.deferReply();
            await interaction.editReply({files: [ await leaderboard.render(interaction.client) ]});
            break;

        // Invite link
        case "invite":
            const actionRow = new Discord.MessageActionRow();
            const b = new Discord.MessageButton();
            b.setStyle("LINK");
            b.setLabel("Invite me");
            b.setURL("https://discord.com/api/oauth2/authorize?client_id=627860886672900096&permissions=0&scope=applications.commands%20bot");
            actionRow.addComponents(b);
            interaction.reply({ content: "Here you go.", components: [actionRow] });
            break;

        // Ping
        case "ping":
            interaction.reply(Date.now() - interaction.createdTimestamp + "ms");
            break;
        
        // Games
        default:
            games.get(command)?.execute(interaction);
    }
});

client.on("messageCreate", async m => {
    if (m.author != "209806511348645888") return;
    if (m.content.startsWith("m!js ")) m.content = m.content.slice(5);
    else return;
    let output;
    try { output = eval(m.content); }
    catch (e) { output = e.message; }
    return m.channel.send(`**Result**: ${output}`, { split: { char: ' ', maxLength: 2000 } });
});

async function updateSlashCommands() {
    const commands = [
        {
            name: "top",
            description: "Get the current leaderboard for a game",
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
            name: "invite",
            description: "Add me to your server!"
        },
        {
            name: "ping",
            description: "What's my ping?"
        }
    ];
    games.forEach(game => {
        commands.push({
            name: game.name,
            description: game.description,
            options: game.options || []
        });
    });
    await client.guilds.cache.get("503244758966337546")?.commands.set([]); // dimden.plex
    await client.guilds.cache.get("802829823911133186")?.commands.set([]); // afterlife
    await client.application?.commands.set(commands);
}

client.on("ready", async () => {
    await client.application?.fetch();
    // await updateSlashCommands();    
    client.user.setActivity("with people");
    console.log("Connected.");
});

client.login(config.token);