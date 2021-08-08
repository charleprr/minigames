import { Leaderboard } from "../libraries/leaderboard.js";
import randword from "random-words";

export const name = "typerace";
export const description = "Are you the fastest typer?";
export const leaderboard = new Leaderboard(name, false);

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
            interaction.followUp(`${a.member.displayName} won in \`${time.toFixed(3)}\` seconds!`);
            interaction.client.removeListener("messageCreate", onAnswer);
            clearTimeout(timeout);
            leaderboard.add(a.member, { value: time.toFixed(3), unit: "s" });
        }
    };

    const timeout = setTimeout(() => {
        interaction.followUp("It's been 20 seconds! The game is over.");
        interaction.client.removeListener("messageCreate", onAnswer);
    }, 20000);

    interaction.client.on("messageCreate", onAnswer);
};