const leaderboard = require("../libraries/leaderboard");

module.exports = {

    name: "math",
    regex: /^math$/i,
    description: "Be the fastest to solve simple additions!",
    
    run: async (message, bot) => {

        // Initialization
        const A = Math.floor(Math.random() * (99 - 9) + 9);
        const B = Math.floor(Math.random() * (99 - 9) + 9);
        const SUM = A + B;

        const m = await message.channel.send("Get ready...");
        await new Promise(r => setTimeout(r, 2500));
        await m.edit(`Solve **${A} + ${B}** as fast as possible!`);
        const start = Date.now();

        // Temporary message listener
        const onAnswer = a => {
            if (a.channel != message.channel || a.author.bot) return;

            // If the answer === sum, user wins!
            if (a.content == SUM) {
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
            message.channel.send(`It's been 20 seconds! The answer was **${SUM}**.`);
            bot.removeListener("message", onAnswer);
        }, 20000);

        bot.on("message", onAnswer);
    }

};
