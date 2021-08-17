export const name = "ping";
export const description = "What's my ping?";

export async function execute (interaction) {
    interaction.reply("🏓 Pong! (" + interaction.client.ws.ping + "ms)");
}