import Leaderboard from "../libraries/leaderboard.js";
import randword from "random-words";

export const name = "typerace";
export const description = "Are you the fastest typer?";
export const leaderboard = new Leaderboard(name, false, "s");

export async function execute (interaction) {

    const word = randword();
    const filter = m => m.content.toLowerCase() === word;

    await interaction.reply("Get ready...");
    await new Promise(r => setTimeout(r, 2500));
    await interaction.editReply(`Type **${word}** as fast as possible!`);
    const start = Date.now();

    interaction.channel.awaitMessages({ filter, max: 1, time: 20000, errors: ["time"] })
        .then(m => {
            const score = ((Date.now() - start) / 1000).toFixed(3);
            interaction.followUp(`${m.first().member.displayName} won in \`${score}\` seconds!`);
            leaderboard.add(m.first().member, score);
        })
        .catch(() => interaction.followUp("It's been 20 seconds! The game is over."));
    
};