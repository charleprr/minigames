const randword = require("random-words");

module.exports = {
    label: "Typerace",
    description: "Are you the fastest typer?",
    emoji: "⌨️"
};

module.exports.execute = async (client, channel, done) => {

    const word = randword();
    const m = await channel.send("Get ready...");
    await new Promise(r => setTimeout(r, 2500));
    await m.edit(`Type **${word}** as fast as possible!`);
    const start = Date.now();

    const onAnswer = a => {
        if (a.channel != channel || a.author.bot) return;
        if (a.content.toLowerCase() === word) {
            const time = (a.createdTimestamp - start) / 1000;
            channel.send(`${a.author.username} won in \`${time.toFixed(3)}\` seconds!`);
            client.removeListener("message", onAnswer);
            clearTimeout(timeout);
            // We have a winner, let's register his score
            // in the typerace leaderboard
            done(a.author, time.toFixed(3));
        }
    };

    const timeout = setTimeout(() => {
        channel.send("It's been 20 seconds! The game is over.");
        client.removeListener("message", onAnswer);
        // Nobody answered after 20 seconds,
        // we exit with no score to save
        done();
    }, 20000);

    client.on("message", onAnswer);
};