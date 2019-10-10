/**
 * @name Minigames
 * @description A bot with chat games for Discord
 * @repository https://github.com/charlypoirier/minigames
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

// Create a new Bot
let bot = new Bot("!", secrets.discordToken);


/**
 * 
 * 
 */
bot.add("math", "", message => {

	// Reject the request if the bot is busy
	if (bot.isBusy) return;
	bot.isBusy = true;

	let highscore = Number(Database.highscores.math[0].score).toFixed(3);
	let holder = Database.highscores.math[0].name;
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

			// Separate event listener for messages
			let listener = answer => {
				if (answer.content == result && answer.channel.id == channelId) {
					let time = (answer.createdTimestamp - startTime) / 1000;
					clearTimeout(timeLimit);

					let endMessage = answer.author.username+" won in **"+time.toFixed(3)+"** seconds!";
					if (time < highscore) {
						message.channel.send(endMessage+" **NEW RECORD!**");
						//Database.update("highscores", {}, {$set:{"math": {"tag": answer.author.tag, "name": answer.author.username, "score": time}}});
					} else {
						message.channel.send(endMessage);
					}
					
					bot.isBusy = false;
					bot.client.removeListener('message', listener);
				}
			};
			bot.on('message', listener);

			// Set a time limit of 30 seconds
			let timeLimit = setTimeout(() => {
				message.channel.send("It's been 30 seconds! The game is over.\nThe correct answer was **"+result+"**.");
				bot.client.removeListener('message', listener);
				bot.isBusy = false;
			}, 30000);
		});
	}, 4000);
}, "An easy math problem to solve as quick as possible!", false);


/**
 * 
 * 
 */
bot.add("type", "", message => {

	// Reject the request if the bot is busy
	if (bot.isBusy) return;
	bot.isBusy = true;
	
	let highscore = Number(Database.highscores.type.score).toFixed(3);
	let holder = Database.highscores.type.name;
	message.channel.send("> Current highscore is **"+highscore+"** seconds by "+holder+".\n> Get ready...");

	// Getting a random word
	let word = words();

	// Some delay before the game starts
	setTimeout(() => {

		let startTime;
		let channelId = message.channel.id;

		message.channel.send("Type __**"+word+"**__ as fast as possible!").then(() => {

			// Record the current timestamp
			startTime = Date.now();

			// Separate event listener for messages
			let listener = answer => {
				if (answer.content.toLowerCase() == word && answer.channel.id == channelId) {
					let time = (answer.createdTimestamp - startTime) / 1000;
					clearTimeout(timeLimit);

					let endMessage = answer.author.username+" won in **"+time.toFixed(3)+"** seconds!";
					if (time < highscore) {
						message.channel.send(endMessage+" **NEW RECORD!**");
						Database.update("highscores", {}, {$set:{"type": {"tag": answer.author.tag, "name": answer.author.username, "score": time}}});
					} else {
						message.channel.send(endMessage);
					}
					
					bot.isBusy = false;
					bot.client.removeListener('message', listener);
				}
			};
			bot.on('message', listener);

			// Set a time limit of 30 seconds
			let timeLimit = setTimeout(() => {
				message.channel.send("It's been 30 seconds! The game is over.");
				bot.client.removeListener('message', listener);
				bot.isBusy = false;
			}, 30000);
		});
	}, 4000);
}, "A fun typing race between players!", false);


/**
 * 
 * 
 */
bot.add("shuffle", "", message => {
	
	// Reject the request if the bot is busy
	if (bot.isBusy) return;
	bot.isBusy = true;
	
	let highscore = Number(Database.highscores.shuffle.score).toFixed(3);
	let holder = Database.highscores.shuffle.name;
	message.channel.send("> Current highscore is **"+highscore+"** seconds by "+holder+".\n> Get ready...");

	// Getting a random word and shuffling it
	let word = words();
	let shuffledWord = word;
	while (shuffledWord == word) shuffledWord = shuffledWord.shuffle();

	// Some delay before the game starts
	setTimeout(() => {

		let startTime;
		let channelId = message.channel.id;

		message.channel.send("Unshuffle the word  __**"+shuffledWord+"**__ !").then(() => {

			// Record the current timestamp
			startTime = Date.now();

			// Separate event listener for messages
			let listener = answer => {
				if (answer.content.toLowerCase() == word && answer.channel.id == channelId) {
					let time = (answer.createdTimestamp - startTime) / 1000;
					clearTimeout(timeLimit);

					let endMessage = answer.author.username+" won in **"+time.toFixed(3)+"** seconds!";
					if (time < highscore) {
						message.channel.send(endMessage+" **NEW RECORD!**");
						Database.update("highscores", {}, {$set:{"shuffle": {"tag": answer.author.tag, "name": answer.author.username, "score": time}}});
					} else {
						message.channel.send(endMessage);
					}
					
					bot.isBusy = false;
					bot.client.removeListener('message', listener);
				}
			};
			bot.on('message', listener);

			// Set a time limit of 30 seconds
			let timeLimit = setTimeout(() => {
				message.channel.send("It's been 30 seconds! The game is over.\nThe correct answer was **"+word+"**.");
				bot.client.removeListener('message', listener);
				bot.isBusy = false;
			}, 30000);
		});
	}, 4000);
}, "Be the quickest to find the shuffled word!", false);


/**
 * Shows the current 3 best players for a given game.
 */
bot.add("leaderboard", "[game]", message => {
	let game = message.content.substring(message.content.split(" ")[0].length+1);
	let emojis = [":first_place:", ":second_place:", ":third_place:"]
	if (["math", "type", "shuffle"].indexOf(game) != -1) {
		let leaderboard = "> "+bot.prefix+game+" **leaderboard** :trophy:";
		for (let i=0; i<Database.highscores[game].length; i++) {
			leaderboard += "\n> "+emojis[i]+" (**"+(Database.highscores[game])[i].score+"**s) "+(Database.highscores[game])[i].name;
		}
		message.channel.send(leaderboard);
	} else {
		message.channel.send("This game doesn't exist!")
	}
}, "Shows the current 3 best players for a given game.", false);


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
}, "Executes JavaScript code.", true);


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
}, "Pulls code from the repository and restarts the bot.", true);


/**
 * Shuffle method for strings,
 * used for the shuffle game.
 */
String.prototype.shuffle = function() {
    let a = this.split("");
	let n = a.length;
	let j, tmp;
    for(let i=n-1; i>0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
	return a.join("");
};

bot.start();
