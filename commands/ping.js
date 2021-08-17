export const name = "ping";
export const description = "What's my ping?";

export async function execute (interaction) {
    interaction.reply(Date.now() - interaction.createdTimestamp + "ms");
}