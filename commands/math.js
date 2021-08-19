import Leaderboard from "../libraries/leaderboard.js";

export const name = "math";
export const description = "Be the first to solve simple math additions.";
export const leaderboard = new Leaderboard(name, false, "s");

export async function execute (interaction) {

    const A = Math.floor(Math.random() * 90) + 10;
    const B = Math.floor(Math.random() * 90) + 10;
    const ANSWER = A + B;
    const filter = m => m.content == ANSWER;

    await interaction.reply("Get ready...");
    await new Promise(r => setTimeout(r, 2500));
    await interaction.editReply(`What's **${A} + ${B}** ?`);
    const start = Date.now();

    interaction.channel.awaitMessages({ filter, max: 1, time: 20000, errors: ["time"] })
        .then(m => {
            const score = ((Date.now() - start) / 1000).toFixed(3);
            interaction.followUp(`${m.first().member.displayName} won in \`${score}\` seconds!`);
            leaderboard.add(m.first().member, score);
        })
        .catch(() => interaction.followUp(`It's been 20 seconds! The answer was **${ANSWER}**.`));
    
};