//import Leaderboard from "../../libraries/leaderboard.js"

export const name = "guessmynumber"
export const description = "Guess the number I am thinking of!"
//export const leaderboard = new Leaderboard(name, false, "s")

export async function execute (interaction) {

    const number = Math.random() * 100 | 0
    //const filter = m => m.content == number

    await interaction.reply("Get ready...")
    await new Promise(r => setTimeout(r, 2500))
    await interaction.editReply(`What's my number? Go!`)
    const start = Date.now()

    interaction.channel.awaitMessages({ time: 40000, errors: ["time"] })
        .then(m => {
            if (!isNaN(m.content)) {
              if (m.content > number) m.reply("**Lower!**")
              if (m.content < number) m .reply("**Higher!**")
              if (m.content == number) {
                const score = ((Date.now() - start) / 1000).toFixed(3)
                interaction.followUp(`${m.first().member.displayName} won in \`${score}\` seconds!`)
                //leaderboard.add(m.first().member, score)
              }
            }
        })
        .catch(() => interaction.followUp(`It's been 40 seconds! I was thinking of **${A}**.`))
    
}
