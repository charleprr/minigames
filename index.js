const Discord = require("discord.js");
const client = new Discord.Client();
const disbut = require("discord-buttons");
disbut(client);
const config = require("./config.json");
const fs = require("fs");
let playing = false;

/**
 * Create and manage leaderboards
 */
class Leaderboard {

    constructor (name) {
        this.file = `database/${name}.json`;
    }

    register (user, score) {
        
        // Create a leaderboard, if it doesn't exist
        if (!fs.existsSync(this.file)) {
            fs.writeFileSync(this.file, JSON.stringify({
                name: this.name,
                scores: [],
                created: Date.now()
            }, null, 4));
        }

        // Read and update the scores
        const data = JSON.parse(fs.readFileSync(this.file));
        data.scores.push({
            user: user.tag,
            score: score
        });

        // Save it
        fs.writeFileSync(this.file, JSON.stringify(data, null, 4));
    }

    reset () {
        fs.unlinkSync(this.file);
    }

};

/**
 * Load games
 */
const games = new Map();
fs.readdir("./commands/", (err, files) => {
    if (err) throw err;
    files.forEach(file => {
        const command = require(`./commands/${file}`);
        games.set(command.label, {
            ...command,
            leaderboard: new Leaderboard(command.label)
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
    
    let label = m.content.substring(1).split()[0].toLowerCase();
    if (label == "help") {
        menu = new disbut.MessageMenu().setID("games").setPlaceholder("List of available games")
        games.forEach(value => {
            menu.addOption(new disbut.MessageMenuOption({...value, value:true, disable:true}));
        });
        return m.channel.send("Here is a list of available games", menu);
    }

    let game = games.get(label);
    if (game) {
        playing = true;
        game.execute(client, m.channel, (user, score) => {
            playing = false;
            if (!user || !score) return;
            game.leaderboard.register(user, score);
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