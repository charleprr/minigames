const Discord = require("discord.js");
const config = require("./config.json");
const client = new Discord.Client();
const fs = require("fs");

// Loading games...
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

// Listen for messages
client.on("message", async m => {
    if (m.author.bot) return;
    if (m.content != "!typerace") return;
    games.get("typerace").execute(client, m.channel, ()=>{});
});

// Startup
client.on("ready", () => client.user.setActivity("around"));
client.login(config.token);