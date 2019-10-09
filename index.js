/**
 * @name Minigames
 * @author Charly#7870
 */

// Dependencies
const Bot = require("./Bot.js");
const Database = require("./Database.js");

// Modules
const words = require("random-words");
const child_process = require("child_process");

// Secrets
const secrets = require('./secrets.json');

let bot = new Bot("!", secrets.discordToken);



bot.add("math", "", message => {

	// Reject the request if the bot is busy
	if (bot.isBusy) return;
	bot.isBusy = true;

	let highscore = Number(Database.highscores.math.score).toFixed(3);
	let holder = Database.highscores.math.name;
	message.channel.send("> Current highscore is **"+highscore+"** seconds by "+holder+".\n> Get ready...");
	
	// Generating the numbers between 21 and 100
	let a = Math.floor(Math.random()*80)+21;
	let b = Math.floor(Math.random()*80)+21;
	let result = a + b;

	// Some delay before the game starts
	setTimeout(() => {

		let startTime;
		let channelId = message.channel.id;

		message.channel.send("What's **"+a+" + "+b+"** ?").then(() => {

			// Record the current timestamp
			startTime = Date.now();

			// Set a time limit of 30 seconds
			let timeLimit = setTimeout(() => {
				message.channel.send("It's been 30 seconds! The game is over.\nThe correct answer was **"+result+"**.");
				bot.isBusy = false;
			}, 30000);

			// Separate event listener for messages
			let listener = answer => {
				if (answer.content == result && answer.channel.id == channelId) {
					let time = (answer.createdTimestamp - startTime) / 1000;
					clearTimeout(timeLimit);

					let endMessage = answer.author.username+" won in **"+time.toFixed(3)+"** seconds!";
					if (time < highscore) {
						message.channel.send(endMessage+" **NEW RECORD!**");
						Database.update("highscores", {}, {$set:{"math": {"tag": answer.author.tag, "name": answer.author.username, "score": time}}});
					} else {
						message.channel.send(endMessage);
					}
					
					bot.isBusy = false;
					bot.client.removeListener('message', listener);
				}
			};
			bot.on('message', listener);
		});
	}, 4000);
}, "An easy math problem to solve as quick as possible!", false);


bot.add("type", "", message => {

	if (bot.isBusy) return;
	
	message.channel.send("> Current highscore is **"+Number(Database.highscores.type.score).toFixed(3)+"** seconds by "+Database.highscores.type.name+".\n> Get ready...");
	bot.isBusy = true;

	let word = words();
	let cgj = "\u034f";
	let display_word = "";
	for (let c of word) display_word += Math.random()>0.5? cgj+c: c+cgj;

	setTimeout(() => {
		message.channel.send("Type __**"+display_word+"**__ as fast as possible!");
		let startTime = Date.now();
		let x = setInterval(() => {
			if ((Date.now() - startTime) / 1000 > 30.000){
				message.channel.send("It's been 30 seconds! The game is over.");
				clearInterval(x);
				bot.isBusy = false;
			}
		}, 1000);
		let listener = answer => {
			if (bot.isBusy) {
				if (answer.content.toLowerCase() == word) {
					let sec = (answer.createdTimestamp - startTime) / 1000;
					bot.isBusy = false;
					if (sec < Database.highscores.type.score) {
						message.channel.send(answer.author.username+" won in **"+sec.toFixed(3)+"** seconds! **NEW RECORD!**");
						Database.update("highscores", {}, {$set:{"type": {"tag": answer.author.tag, "name": answer.author.username, "score": sec}}});
					} else {
						message.channel.send(answer.author.username+" won in **"+sec.toFixed(3)+"** seconds!");
					}
					clearInterval(x);
					bot.client.removeListener('message', listener);
				}
			}
		};
		bot.on('message', listener);
	}, 4000);
}, "A fun typing race between players!", false);


bot.add("shuffle", "", message => {
	if (bot.isBusy) return;
	
	message.channel.send("> Current highscore is **"+Number(Database.highscores.shuffle.score).toFixed(3)+"** seconds by "+Database.highscores.shuffle.name+".\n> Get ready...");
	bot.isBusy = true;

	let word = words();
	let cgj = "\u034f";
	let display_word = word;
	while(display_word == word) display_word = word.shuffle();

	setTimeout(() => {
		message.channel.send("Unshuffle the word __**"+display_word+"**__ !");
		let startTime = Date.now();
		let x = setInterval(() => {
			if ((Date.now() - startTime) / 1000 > 30.000){
				message.channel.send("It's been 30 seconds! The game is over.\nThe correct answer was **"+word+"**.");
				clearInterval(x);
				bot.isBusy = false;
			}
		}, 1000);
		let listener = answer => {
			if (bot.isBusy) {
				if (answer.content == word) {
					let sec = (answer.createdTimestamp - startTime) / 1000;
					bot.isBusy = false;
					if (sec < Database.highscores.shuffle.score) {
						message.channel.send(answer.author.username+" won in **"+sec.toFixed(3)+"** seconds! **NEW RECORD!**");
						Database.update("highscores", {}, {$set:{"shuffle": {"tag": answer.author.tag, "name": answer.author.username, "score": sec}}});
					} else {
						message.channel.send(answer.author.username+" won in **"+sec.toFixed(3)+"** seconds!");
					}
					clearInterval(x);
					bot.client.removeListener('message', listener);
				}
			}
		};
		bot.on('message', listener);
	}, 4000);
}, "Be the quickest to find the shuffled word!", false);


/**
 * Executes JavaScript code.
 * This command is protected and only accessible to the owner.
 */
bot.add("js", "[code]", message => {
    let code = message.content.substring(message.content.split(" ")[0].length+1);
	try {
        message.channel.send("> "+eval(code.toString()));
	} catch(e) {
		message.channel.send("> "+e+".");
	}
}, "Executes JavaScript code", true);


/**
 * Pulls code from the repository and restarts
 * the bot with the new and updated version.
 * This command is protected and only accessible to the owner.
 */
bot.add("update", "", message => {
	message.channel.send("📥 Updating...").then(() => {
		child_process.execSync("git pull");
		child_process.spawn(process.argv[0], process.argv.slice(1), {stdio: "ignore", detached: true}).unref();
		bot.client.destroy();
		process.exit();
	});
}, "Pulls code from the repository and restarts the bot", true);


/**
 * Shuffle method for strings,
 * used for the shuffle game.
 */
String.prototype.shuffle = function() {
    let a = this.split("");
    let n = a.length;
    for(let i=n-1; i>0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
	return a.join("");
};

bot.start();
