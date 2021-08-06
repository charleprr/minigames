export const label = "Math";
export const description = "Solve simple math problems as quick as possible!";
export const emoji = "🧮";
export const higherFirst = false; // (the lower the score, the better)

export async function execute (interaction) {

    await interaction.reply("Get ready...");
    await new Promise(r => setTimeout(r, 2500));

    const A = Math.floor(Math.random() * 90) + 10;
    const B = Math.floor(Math.random() * 90) + 10;
    await interaction.editReply(`What's **${A} + ${B}** ?`);
    const start = Date.now();

    const onAnswer = a => {
        if (a.channel != interaction.channel || a.author.bot) return;
        if (a.content == A+B) {
            const time = (Date.now() - start) / 1000;
            interaction.channel.send(`${a.member.displayName} won in \`${time.toFixed(3)}\` seconds!`);
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