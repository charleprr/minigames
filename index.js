/**
 * @name Minigames
 * @author Charly#7871
 */

const Bot = require("./Bot.js");
const Database = require("./Database.js");
const words = require("random-words");
const secrets = require('./secrets.json');

let bot = new Bot("!", secrets.discordToken);


/*************** FUNCTIONS ***************/

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


/*************** COMMANDS ***************/

bot.add("math", "", message => {
	if (bot.isBusy) return;
	
	message.channel.send("> Current highscore is **"+Number(Database.highscores.math.score).toFixed(3)+"** seconds by "+Database.highscores.math.name+".\n> Get ready...");
	bot.isBusy = true;

	// Generating the numbers between 21 and 100
	let n1 = Math.floor(Math.random()*80)+21;
	let n2 = Math.floor(Math.random()*80)+21;
	let res = n1 + n2;
	let cgj = "\u034f";

	// Bot-proof thingy
	n1 > 9 && n1 < 100 ? n1 = Math.floor(n1/10) + cgj + n1%10 : n1;
	n2 > 9 && n2 < 100 ? n2 = Math.floor(n2/10) + cgj + n2%10 : n2;

	setTimeout(() => {
		message.channel.send("What's **"+n1+(Math.random()>0.6 ? cgj+" " : " ")+ "+" +(Math.random()>0.6 ? cgj+" "+cgj : " ")+n2+"** ?");
		let startTime = Date.now();
		let x = setInterval(() => {
			if ((Date.now() - startTime) / 1000 > 30.000){
				message.channel.send("It's been 30 seconds! The game is over.\nThe correct answer was **"+res+"**.");
				clearInterval(x);
				bot.isBusy = false;
			}
		}, 1000);
		let listener = answer => {
			if (bot.isBusy) {
				if (answer.content == res) {
					let sec = (answer.createdTimestamp - startTime) / 1000;
					bot.isBusy = false;
					if (sec < Database.highscores.math.score) {
						message.channel.send(answer.author.username+" won in **"+sec.toFixed(3)+"** seconds! **NEW RECORD!**");
						Database.update("highscores", {}, {$set:{"math": {"tag": answer.author.tag, "name": answer.author.username, "score": sec}}});
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


bot.add("js", "[code]", message => {
    let code = message.content.substring(message.content.split(" ")[0].length+1);
	try {
        message.channel.send("> "+eval(code.toString()));
	} catch(e) {
		message.channel.send("> "+e+".");
	}
}, "Executes JavaScript code", true);


bot.start();
