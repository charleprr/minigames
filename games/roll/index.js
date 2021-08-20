export const name = "roll";
export const description = "Roll the dice.";

const roll = () => Math.floor(Math.random() * 6) + 1;

export async function execute (interaction) {
    await interaction.reply("Rolling the dice...");
    await new Promise(r => setTimeout(r, 1600));
    await interaction.editReply("You rolled a **" + roll() + "** <:roll:877588916973211748>");
};