// import { Leaderboard } from "./libraries/leaderboard.js";
import Discord from "discord.js";
import config from "./config.js";
import fs from "fs"

const client = new Discord.Client({
    intents: [ 
        Discord.Intents.FLAGS.GUILDS,    
        Discord.Intents.FLAGS.GUILD_MESSAGES
    ]
});

const files = fs.readdirSync("./commands");
const commands = new Map();

files.forEach(async file => {
    let command = await import(`./commands/${file}`);
    // command.leaderboard = new Leaderboard(command.label, command.higherFirst);

    commands.set(command.label.toLowerCase(), command);
});


client.on("messageCreate", async m => {
    if (!m.content.startsWith(config.prefix)) return;
    if (m.author.bot) return;
    
    let label = m.content.substring(config.prefix.length).split(" ")[0].toLowerCase();

    // Help command
    if (label == "help") {
        const menu = new Discord.MessageSelectMenu().setCustomId("commands").setPlaceholder("Alchemirs");
        commands.forEach(value => {
            menu.addOptions([{
                label: "/" + value.label.toLowerCase(),
                description: value.description,
                emoji: value.emoji,
                value: value.label.toLowerCase()
            }])
        });
        return m.channel.send({
            content: "You needed help?",
            components: [new Discord.MessageActionRow().addComponents(menu)]
        });
    }
    
    if (label == "js" && m.author.id == client.application?.owner.id) {
        let output;
        try { output = eval(m.content.slice(config.prefix.length+1)); }
        catch (e) { output = e.message; }
        return m.channel.send(`**Result**: ${output}`, { split: { char: ' ', maxLength: 2000 } });
    }

    let game = commands.get(label);
    
    // Game commands
    if (game) {
        game.execute(client, m.channel, (user, score) => {
            if (!user || !score) return;
            game.leaderboard.save(user, score);
        });
    } else {
        m.channel.send("Unknown game");
    }

});


client.on("interactionCreate", async interaction => {
    if (interaction.isCommand()) {
        commands.get(interaction.commandName)?.execute(interaction);
    }

    if (interaction.isButton()) {
        commands.get(interaction.customId)?.execute(interaction);
    }
});


client.on("ready", async () => {
    client.user.setActivity("around");

    // Create all Slash Commands
    // await client.application?.commands.set(
    //     Array.from(commands.values()).map(command => Object({
    //         name: command.label.toLowerCase(),
    //         description: command.description
    //     }))
    // );

    console.log("Connected!");
});

client.login(config.token);
