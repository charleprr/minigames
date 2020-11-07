const Discord = require("discord.js");
const leaderboard = require(`./leaderboard`);

class Bot {

    /**
     * Constructor for the Bot class
     */
	constructor (prefix, token, owner) {
		this.prefix = prefix;
        this.token = token;
        this.owner = owner;
        this.client = new Discord.Client();
        this.games = [];
	}

    /**
     * This methods starts the bot
     * It creates a Discord client and sets up event listeners
     */
	start () {

        this.client.on("ready", () => {
            console.log(`Logged in as ${this.client.user.tag}!`);
            this.client.user.setActivity(`games, try ${this.prefix}help`);
        });

        this.client.on("message", async m => {

            if (m.author.bot) return;
            if (m.channel.locked) return;
            if (!m.guild) return;

            if (m.content.startsWith(this.prefix)) {

                let args = m.content.split(" ");
                let cmd = args[0].toLowerCase().slice(this.prefix.length);

                // Game commands
                for (const game of this.games) {
                    if (cmd.match(game.regex)) {
                        m.channel.locked = true;
                        m.channel.send(leaderboard.make(m.guild.id, game.name));
                        await game.run(m, this);
                        m.channel.locked = false;
                        return;
                    }
                }

                // Help command
                if (cmd === "help") {
                    const embed = new Discord.MessageEmbed();
                    embed.setColor('#f44239');
                    embed.setAuthor('Available games', 'https://i.ibb.co/wcsw228/profile.png');
                    for (let game of this.games) {
                        embed.addField(this.prefix + game.name, game.description);
                    }
                    embed.addField("\u200B", "[» Invite the bot](https://discord.com/api/oauth2/authorize?client_id=627860886672900096&permissions=0&scope=bot)\n[» Source code on GitHub](https://github.com/charlypoirier/minigames)")
                    return m.channel.send(embed);
                }
                
                // Debug command for the owner
                if (m.author == this.owner && cmd === "js") {
                    let output;
                    try { output = eval(m.content.slice(4)); }
                    catch (e) { output = e.message; }
                    m.channel.send(`**Result**: ${output}`, {split: {char:' ', maxLength:2000}});
                }
            }
        });
        
        this.client.login(this.token);
    }

    /**
     * This sets up an event listener and calls a function
     * whenever the event happens
     */
    on (event, action) {
        this.client.on(event, action);
    }

    /**
     * This removes an event listener
     */
    removeListener (event, action) {
        this.client.removeListener(event, action);
    }

};

module.exports = Bot;