const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");

/**
 * Create and manage leaderboards
 */
class Leaderboard {

    constructor (name, highestFirst=true) {
        this.file = "database/" + name + ".json";
        this.highestFirst = highestFirst;
    }

    register (user, score) {
        const data = JSON.parse(fs.readFileSync(this.file));
        /* Update data.scores */
        fs.writeFileSync(this.file, JSON.stringify(data, null, 4));
    }

    reset () {}

};

/**
 * Load games
 */
const games = new Map();
fs.readdir("./commands/", (err, files) => {
    if (err) throw err;
    files.forEach(file => {
        const component = require("./commands/" + file);
        games.set(component.name, {
            description: component.description,
            execute: component.execute
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
    
    let name = m.content.substring(1).split()[0];
    let game = games.get(name);
    if (game) {
        playing = true;
        game.execute(client, m.channel, (user, score) => {
            playing = false;
            /* Register score */
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