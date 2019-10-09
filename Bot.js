const Discord = require("discord.js");
const Database = require("./Database.js");

class Bot {

	constructor(prefix, token) {
		this.prefix = prefix;
		this.token = token;
        this.client = new Discord.Client();
        this.commands = [];
        this.isBusy = false;
		Database.initialize();
	}

	start() {
        this.client.login(this.token);

        this.client.on("ready", () => {
            console.log("Logged in as "+this.client.user.tag+"!");
            this.client.user.setActivity("minigames ("+this.prefix+"games)");
            this.client.channels.get("450609429612855296").send(":white_check_mark: Connected !");
        });

        let self = this;
        this.client.on("message", message => {
            /* The bot can't trigger commands */
            if (message.author.tag == "Minigames#0997") return;

            /* Check for commands */
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
                /* Help command equivalent */
                if (cmd == "games" && !self.isBusy) {
                    const embed = new Discord.RichEmbed()
                    .setColor('#0099ff')
                    .setAuthor('Available games', 'https://i.ibb.co/wcsw228/profile.png')
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

    on(event, action) {
        this.client.on(event, action);
    }
    
    add(cmd, args, func, desc, isProtected) {
        this.commands.push({
            cmd: cmd,
            args: args,
            func: func,
            desc: desc,
            isProtected: isProtected
        });
    }

};

module.exports = Bot;
