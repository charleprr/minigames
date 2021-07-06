const Discord = require("discord.js");
const client = new Discord.Client();
const disbut = require("discord-buttons");
disbut(client);
const config = require("./config.json");
const fs = require("fs");

let playing = false;

/**
 * Create and manage leaderboards
 * (assuming the lower the score the better for now)
 */
class Leaderboard {

    constructor(name, higherFirst=true) {
        this.file = `database/${name.toLowerCase()}.json`;
        this.higherFirst = higherFirst;
    }

    save(user, score) {
        // Create a leaderboard, if it doesn't exist
        if (!fs.existsSync(this.file)) {
            fs.writeFileSync(this.file, "[]");
        }

        // Read and update the scores
        const scores = new Map(JSON.parse(fs.readFileSync(this.file)));
        if (this.higherFirst) {
            if (scores.get(user.id)?.score > score) return;
        } else {
            if (scores.get(user.id)?.score < score) return;
        }
        scores.set(user.id, {
            username: user.username,
            score: score
        });

        // Save it
        fs.writeFileSync(this.file, JSON.stringify([...scores], null, 4));
    }

    reset() { fs.unlinkSync(this.file); }
};

/**
 * Load games
 */
const games = new Map();
fs.readdir("./commands/", (err, files) => {
    if (err) throw err;
    files.forEach(file => {
        const command = require(`./commands/${file}`);
        games.set(command.label.toLowerCase(), {
            ...command,
            leaderboard: new Leaderboard(command.label, command.higherFirst)
        });
    });
});

/**
 * Listen for messages
 */
client.on("message", async m => {
    if (!m.content.startsWith("!")) return;
    if (m.author.bot) return;
    if (playing) return;
    
    let label = m.content.substring(1).split(" ")[0].toLowerCase();

    // Help command
    if (label == "help") {
        menu = new disbut.MessageMenu()
            .setID("games")
            .setPlaceholder("List of commands")
        menu.addOption({value:10, label:"!help", description:"Not too hard to understand", emoji:"❔"});
        menu.addOption({value:12, label:"!top <game>", description:"Display cross-server highscores for a game", emoji:"🏆"});
        games.forEach(value => {
            menu.addOption(new disbut.MessageMenuOption({
                label: "!" + value.label.toLowerCase(),
                description: value.description,
                emoji: value.emoji,
                value:true}));
        });
        return m.channel.send("Here is a list of available games", menu);
    }
    
    if (label == "js" && m.author == config.owner) {
        let output;
        try { output = eval(m.content.slice(3)); }
        catch (e) { output = e.message; }
        return m.channel.send(`**Result**: ${output}`, { split: { char: ' ', maxLength: 2000 } });
    }

    let game = games.get(label);
    
    // Game commands
    if (game) {
        playing = true;
        game.execute(client, m.channel, (user, score) => {
            playing = false;
            if (!user || !score) return;
            game.leaderboard.save(user, score);
        });
    } else {
        m.channel.send("Unknown game");
    }

});

/**
 * Startup
 */
client.on("ready", () => client.user.setActivity("around"));
client.login(config.token);