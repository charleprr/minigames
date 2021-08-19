import Leaderboard from "../libraries/leaderboard.js";
import randword from "random-words";

const shuffle = function(string) {
    let a = string.split(""), n = a.length;
    for(let i = n - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}

export const name = "jumble";
export const description = "Can you guess the shuffled word?";
export const leaderboard = new Leaderboard(name, false, "s");

export async function execute (interaction) {

    const word = randword();
    let shuffledWord;
    do {
        shuffledWord = shuffle(word);
    } while(shuffledWord === word);
    
    const filter = m => m.content.toLowerCase() === word;

    await interaction.reply("Get ready...");
    await new Promise(r => setTimeout(r, 2500));
    await interaction.editReply(`Deshuffle **${shuffledWord}** as fast as possible!`);
    const start = Date.now();

    interaction.channel.awaitMessages({ filter, max: 1, time: 20000, errors: ["time"] })
        .then(m => {
            const score = ((Date.now() - start) / 1000).toFixed(3);
            interaction.followUp(`${m.first().member.displayName} won in \`${score}\` seconds!`);
            leaderboard.add(m.first().member, score);
        })
        .catch(() => interaction.followUp(`It's been 20 seconds! The word was **${word}**.`));
    
};