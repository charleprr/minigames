const leaderboard = require("../libraries/leaderboard");
const randomWord = require("random-words");

module.exports = {

    name: "shuffle",
    regex: /^shuffle$/i,
    description: "Be the quickest to find the shuffled word!",
    
    run: async (message, bot) => {

        // Initialization
        const word = randomWord();
        let shuffled = word.shuffle();
        while (shuffled === word) shuffled = word.shuffle();

        const m = await message.channel.send("Get ready...");
        await new Promise(r => setTimeout(r, 2500));
        await m.edit(`Unshuffle __**${shuffled}**__ as fast as possible!`);
        const start = Date.now();

        // Temporary message listener
        const onAnswer = a => {
            if (a.channel != message.channel || a.author.bot) return;

            // If the answer === the word, user wins!
            if (a.content.toLowerCase() === word) {
                const time = (a.createdTimestamp - start) / 1000;
                message.channel.send(`${a.member.displayName} won in \`${time.toFixed(3)}\` seconds!`);

                // Automatically update the leaderboard
                leaderboard.register(message.guild.id, module.exports.name, {
                    player: a.author.id, // The user ID
                    score: time          // Any kind of score (lowest is best)
                });

                bot.removeListener("message", onAnswer);
                clearTimeout(timeout);
            }
        };

        // Timeout function
        const timeout = setTimeout(() => {
            message.channel.send(`It's been 20 seconds! The word was __**${word}**__.`);
            bot.removeListener("message", onAnswer);
        }, 20000);

        bot.on("message", onAnswer);
    }

};

String.prototype.shuffle = function () {
    var a = this.split(""),
        n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}