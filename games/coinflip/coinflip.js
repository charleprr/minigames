export const name = "coinflip"
export const description = "Flip a coin!"

const coin = () => new Date%2?"Heads!":"Tails!"

export async function execute (interaction) {
    await interaction.reply("Call it...")
    await new Promise(r => setTimeout(r, 1600))
    await interaction.editReply(`**${coin}!**`)
}
