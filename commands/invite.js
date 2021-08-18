import { MessageActionRow, MessageButton } from "discord.js";

export const name = "invite";
export const description = "Add me to your server!";

export async function execute (interaction) {
    return interaction.reply(`[Click here!](https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=0&scope=applications.commands%20bot)`)
    const linkButton = new MessageButton();
    linkButton.setLabel("Invite me");
    linkButton.setStyle("LINK");
    linkButton.setURL(`https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=0&scope=applications.commands%20bot`);
    const actionRow = new MessageActionRow().addComponents(linkButton);
    interaction.reply({ content: "Here you go.", components: [actionRow] });
}