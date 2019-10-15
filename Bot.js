const Discord = require("discord.js");
const Database = require("./Database.js");

class Bot {

    /**
     * Constructor for the class Bot
     * @param {string} prefix The default command prefix.
     * @param {string} token A discord token.
     */
	constructor(prefix, token) {
		this.prefix = prefix;
		this.token = token;
        this.isBusy = false;
        this.client = new Discord.Client();

        // Where command objects are stored
        this.commands = [];

        // Gather highscores from the database
		Database.initialize();
	}

    /**
     * This methods starts the bot.
     * It creates a Discord client and sets up event listeners.
     */
	start() {
        this.client.login(this.token);

        this.client.on("ready", () => {
            console.log("Logged in as "+this.client.user.tag+"!");
            this.client.user.setActivity("minigames ("+this.prefix+"help)");

            // Channel #bot-control in JPDLD's Discord server
            this.client.channels.get("450609429612855296").send(":white_check_mark: Connected !");
        });

        let self = this;
        this.client.on("message", message => {
            
            // Preventing the bot and other bots from triggering anything
            if (message.author.tag == self.client.user.tag || message.author.bot) return;

            // Check for command calls
            if (message.content.startsWith(self.prefix)) {
                let args = message.content.split(" ");
				let cmd = args[0].toLowerCase().slice(self.prefix.length);
                for (let object of self.commands) {
                    if (cmd == object.cmd && !self.isBusy) {
                        if (object.isProtected) {
                            if (message.author.tag == "Charly#7870") {
                                object.func(message);
                            } else {
                                message.channel.send("> ❌ **You don't have access to this command !**");
                            }
                        } else {
                            object.func(message);
                        }
                    }
                }
                // Help command
                if (cmd == "help" && !self.isBusy) {
                    const embed = new Discord.RichEmbed().setColor('#0099ff').setAuthor('Commands', 'https://i.ibb.co/wcsw228/profile.png')
                    for (let object of self.commands) {
                        if (!object.isProtected) {
                            embed.addField(self.prefix+object.cmd+" "+object.args, object.desc);  
                        }
                    }
                    message.channel.send(embed);
                }
            }
        });
    }
    
    /**
     * This method adds a command to the bot.
     * @param {string} cmd The command name.
     * @param {string} args A description of the arguments needed for the command.
     * @param {function} func The function to be executed when the command is called.
     * @param {string} desc A description of the command.
     * @param {boolean} isProtected If true, the command will be only available to the owner.
     */
    add(cmd, args, func, desc, isProtected) {
        this.commands.push({
            cmd: cmd,
            args: args,
            func: func,
            desc: desc,
            isProtected: isProtected
        });
    }

    /**
     * This sets up an event listener and calls a function
     * whenever the event happens.
     * @param {string} event The name of the event.
     * @param {function} action The function to be executed.
     */
    on(event, action) {
        this.client.on(event, action);
    }

};

module.exports = Bot;
