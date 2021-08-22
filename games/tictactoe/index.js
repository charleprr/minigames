import Tictactoe from "./tictactoe.js";
import Discord from "discord.js";

export const name = "tictactoe";
export const description = "Play tic-tac-toe against someone!";
export const options = [{
    name: "opponent",
    type: "USER",
    description: "Who do you want to play against?",
    required: true
}];

export async function execute (interaction) {

    const playerX = interaction.guild.members.cache.get(interaction.options.get("opponent").user.id);
    const playerO = interaction.member;

    if (playerX.id === playerO.id) {
        return interaction.reply({ content: "You cannot play against yourself", ephemeral: true });
    } else if (playerX.user.bot) {
        return interaction.reply({ content: "You cannot play against bots", ephemeral: true });
    }

    const tictactoe = new Tictactoe(playerX, playerO);

    if (!await challenge(tictactoe, interaction))
        return interaction.editReply({ content: "Game cancelled.", components: [] });
        
    tictactoe.start(interaction);
};

async function challenge(tictactoe, interaction) {
    await interaction.reply({
        content: `<@${tictactoe.players["X"].id}>, would you like to play tic-tac-toe ?`,
        components: [
            new Discord.MessageActionRow().addComponents(
                new Discord.MessageButton().setCustomId(`${tictactoe.id};yes`).setStyle("SUCCESS").setLabel("Yes"),
                new Discord.MessageButton().setCustomId(`${tictactoe.id};no`).setStyle("DANGER").setLabel("No")
            )
        ]
    });
    const message = await interaction.fetchReply();
    const filter = i => i.customId.startsWith(tictactoe.id)
        && i.member.id === tictactoe.players["X"].id;
    return new Promise(respond => {
        message.awaitMessageComponent({ filter, max: 1, time: 60000 })
            .then(i => i.deferUpdate() && respond(i.customId.includes("yes")))
            .catch(e => respond(false));
    });
}