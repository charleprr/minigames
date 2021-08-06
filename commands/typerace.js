import randword from "random-words";

export const label = "Typerace";
export const description = "Are you the fastest typer?";
export const emoji = "🙌🏻";
export const higherFirst = false; // (the lower the score, the better)

export async function execute (interaction) {

    const word = randword();
    await interaction.reply("Get ready...");
    await new Promise(r => setTimeout(r, 2500));
    await interaction.editReply(`Type **${word}** as fast as possible!`);
    const start = Date.now();

    const onAnswer = a => {
        if (a.channel != interaction.channel || a.author.bot) return;
        if (a.content.toLowerCase() === word) {
            const time = (Date.now() - start) / 1000;
            interaction.channel.send(`${a.author.username} won in \`${time.toFixed(3)}\` seconds!`);
            interaction.client.removeListener("messageCreate", onAnswer);
            clearTimeout(timeout);
            // We have a winner, let's register his score
            // in the typerace leaderboard
            // done(a.author, time.toFixed(3));
        }
    };

    const timeout = setTimeout(() => {
        interaction.channel.send("It's been 20 seconds! The game is over.");
        interaction.client.removeListener("messageCreate", onAnswer);
        // Nobody answered after 20 seconds,
        // we exit with no score to save
        // done();
    }, 20000);

    interaction.client.on("messageCreate", onAnswer);
};