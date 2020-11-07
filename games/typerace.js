const leaderboard = require("../libs/leaderboard");
const randomWord = require("random-words");

module.exports = {

    name: "typerace",
    regex: /^type(race)?$/i,
    description: "A fun typing race between players!",
    
    run: async (message, bot) => {

        // Initialization
        const word = randomWord();

        const m = await message.channel.send("Get ready...");
        await new Promise(r => setTimeout(r, 2500));
        await m.edit(`Type **${word}** as fast as possible!`);
        const start = Date.now();

        return new Promise(resolve => {

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
                    resolve();
                }
            };

            // Timeout function
            const timeout = setTimeout(() => {
                message.channel.send("It's been 20 seconds! The game is over.");
                bot.removeListener("message", onAnswer);
                resolve();
            }, 20000);

            bot.on("message", onAnswer);
        
        });
    }

};
