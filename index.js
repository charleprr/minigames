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
const checkWord = require('check-word');

// Secrets
const secrets = require('./secrets.json');

// Create a new Bot
let bot = new Bot("!", secrets.discordToken);


/**
 * Updates the database to store highscores.
 * @param {string} game
 * @param {User} user
 * @param {number} score
 * Returns 3 if user MOVED to 3rd place
 * Returns 2 if user MOVED to 2nd place
 * Returns 1 if user MOVED to 1st place
 * Returns 0 otherwise (stayed or didn't beat anything)
 */
function updateLeaderboard(game, user, score) {

	let obj = {"tag": user.tag, "name": user.username, "score": score};
	let arr = Database.highscores[game];
	let isAlreadyIn = false;
	let oldScore, oldIndex;

	for (let i=0; i<arr.length; i++) {
		if (arr[i].tag == user.tag) {
			isAlreadyIn = true;
			oldScore = arr[i].score;
			oldIndex = i;
			break;
		}
	}

	if (score > oldScore) return;

	if (isAlreadyIn) {
		arr.splice(oldIndex, 1);
		arr.push(obj);
		let newIndex = null;
		for (let i=0; i<arr.length-1; i++) {
			for (let j=0; j<arr.length-i-1; j++) {
				if (arr[j].score > arr[j+1].score) {
					if (arr[j].tag == obj.tag) newIndex = j+1;
					temp = arr[j];
					arr[j] = arr[j+1];
					arr[j+1] = temp;
				}
			}
		}
		if (newIndex != oldIndex) oldIndex = newIndex + 1;
		else oldIndex = 0;
	} else {
		arr.push(obj);
		for (let i=0; i<arr.length-1; i++) {
			for (let j=0; j<arr.length-i-1; j++) {
				if (arr[j].score > arr[j+1].score) {
					if (arr[j].tag == obj.tag) oldIndex = j+1;
					temp = arr[j];
					arr[j] = arr[j+1];
					arr[j+1] = temp;
				}
			}
		}
	}

	let jsonObject = {}
	jsonObject[game] = arr
	Database.update("highscores", {}, {$set:jsonObject});
	Database.highscores[game] = arr;
}


/**
 * 
 * 
 */
bot.add("math", "", message => {

	// Reject the request if the bot is busy
	if (bot.isBusy) return;
	bot.isBusy = true;

	let highscore = Infinity;
	if (Database.highscores.math[0]) {
		highscore = Number(Database.highscores.math[0].score).toFixed(3);
		let holder = Database.highscores.math[0].name;
		message.channel.send("> Current highscore is **"+highscore+"** seconds by "+holder+".\n> Get ready...");
	} else {
		message.channel.send("> There is currently no highscore.\n> Get ready...");
	}
	
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
				if (answer.content == result && answer.channel.id == channelId && !answer.author.bot) {
					let time = (answer.createdTimestamp - startTime) / 1000;
					clearTimeout(timeLimit);
					let endMessage = answer.author.username+" won in **"+time.toFixed(3)+"** seconds!";
					message.channel.send(endMessage+(time<highscore ? " **NEW RECORD!**":""));
					updateLeaderboard("math", answer.author, time);
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

	let highscore = Infinity;
	if (Database.highscores.type[0]) {
		highscore = Number(Database.highscores.type[0].score).toFixed(3);
		let holder = Database.highscores.type[0].name;
		message.channel.send("> Current highscore is **"+highscore+"** seconds by "+holder+".\n> Get ready...");
	} else {
		message.channel.send("> There is currently no highscore.\n> Get ready...");
	}

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
				if (answer.content.toLowerCase() == word && answer.channel.id == channelId && !answer.author.bot) {
					let time = (answer.createdTimestamp - startTime) / 1000;
					clearTimeout(timeLimit);
					let endMessage = answer.author.username+" won in **"+time.toFixed(3)+"** seconds!";
					message.channel.send(endMessage+(time<highscore ? " **NEW RECORD!**":""));
					updateLeaderboard("type", answer.author, time);
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

	let highscore = Infinity;
	if (Database.highscores.shuffle[0]) {
		highscore = Number(Database.highscores.shuffle[0].score).toFixed(3);
		let holder = Database.highscores.shuffle[0].name;
		message.channel.send("> Current highscore is **"+highscore+"** seconds by "+holder+".\n> Get ready...");
	} else {
		message.channel.send("> There is currently no highscore.\n> Get ready...");
	}

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
				if (answer.content.toLowerCase() == word && answer.channel.id == channelId && !answer.author.bot) {
					let time = (answer.createdTimestamp - startTime) / 1000;
					clearTimeout(timeLimit);
					let endMessage = answer.author.username+" won in **"+time.toFixed(3)+"** seconds!";
					message.channel.send(endMessage+(time<highscore ? " **NEW RECORD!**":""));
					updateLeaderboard("shuffle", answer.author, time);
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

bot.add("scrabble", "", message => {
	
	// Reject the request if the bot is busy
	if (bot.isBusy) return;
	bot.isBusy = true;

	let highscore = -1; //-1 < 0
	if (Database.highscores.scrabble[0]) {
		highscore = Database.highscores.scrabble[0].score;
		let holder = Database.highscores.scrabble[0].name;
		message.channel.send("> Current highscore is **"+highscore+"** words by "+holder+".\n> Get ready...");
	} else {
		message.channel.send("> There is currently no highscore.\n> Get ready...");
	}

	//get random string of letters.
	let word = "";
	function getWord() {
		let letters = "abcdefghijklmnopqrstuvwxyz";
		let toReturn = "";
		for (var i = 0; i < 10; i++) {
			toReturn = toReturn.concat(letters[Math.floor(Math.random() * letters.length)]);
		}
		return toReturn;
	}

	//make new string if no vowels.
	while (!word.match(/[aeiouAEIOU]/)) word = getWord(); 

	//stuff regarding words found
	let wordsfound = 0;
	let wrdsfound = [];

	// Some delay before the game starts
	setTimeout(() => {

		let startTime;
		let channelId = message.channel.id;

		message.channel.send(`Find as many words as you can from the letters __**${word}**__ in 60 seconds! You can only use each letter once.`).then(() => {

			// Separate event listener for messages
			let listener = answer => {
				if (answer.author.id == message.author.id && answer.channel.id == channelId && !answer.author.bot) {
					function scramble(world, seed) {
						var arr = new Array(256);
						var i = 0;
				
						for (i = 0; i < 256; i++) {
							arr[i] = 0;
						}
				
						for (i = 0; i < world.length; i++) {
							arr[world.charCodeAt(i)] += 1;
						}
				
						for (i = 0; i < seed.length; i++) {
							arr[seed.charCodeAt(i)] -= 1;
							if (arr[seed.charCodeAt(i)] < 0) {
								return false;
							}
						}
				
						return true;
					}
				
					if (scramble(word, answer.content)) {
						let words = checkWord('en');
						if (words.check(answer.content)) {
							if (!wrdsfound.includes(answer.content)) {
								wordsfound++;
								answer.react("✅");
								wrdsfound.push(answer.content)
							} else {
								answer.channel.send(`❌ You already found that word.`)
							}
						} else {
							answer.channel.send(`❌ That's not a word.`)
						}
					} else {
						answer.channel.send(`❌ That word includes characters not in the letters __**${word}**__`);
					}
				}
			};
			bot.on('message', listener);

			// Set a time limit of 60 seconds
			let timeLimit = setTimeout(() => {
				function getwinmsg() {
					updateLeaderboard("scrabble", message.author, wordsfound);
					let winmsg = `It's been a minute, scrabble game is over. You found __**${wordsfound}**__ ${wordsfound !== 1 ? "words" : "word"}.`;
					if (highscore < wordsfound) {
						winmsg = winmsg.concat(" **NEW RECORD!**");
					}
					return winmsg;
				}
				message.channel.send(getwinmsg());
				bot.client.removeListener('message', listener);
				bot.isBusy = false;
			}, 60000);
		});
	}, 4000);
	
	
}, "Find as many words as you can from a given list of letters!", false)

/**
 * Shows the current 3 best players for a given game.
 */
bot.add("leaderboard", "[game]", message => {
	let game = message.content.substring(message.content.split(" ")[0].length+1);
	let emojis = [":first_place:", ":second_place:", ":third_place:"]
	if (Database.highscores[game]) {
		let leaderboard = "";
		for (let i=0; i<3; i++) {
			if (i <= Database.highscores[game].length-1) {
				leaderboard += "> "+emojis[i]+" **"+(Database.highscores[game])[i].name+"** ("+(Database.highscores[game])[i].score.toFixed(3)+"s)\n";
			} else {
				leaderboard += "> "+emojis[i]+" -\n";
			}
		}
		message.channel.send(leaderboard);
	} else {
		message.channel.send("This game doesn't exist!");
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
