import { commands } from "../index.js";

export const name = "top";
export const description = "Get the current leaderboard for a game!";
export const options = [{
    name: "game",
    type: "STRING",
    description: "Which game?",
    required: true,
    choices: Array.from(commands.values())
       .filter(game => game.leaderboard) // Only keep games with leaderboards
       .map(game => Object({ name: game.name, value: game.name}))
}];

export async function execute (interaction) {
    let name = interaction.options.get("game")?.value;
    let leaderboard = commands.get(name).leaderboard;
    await interaction.deferReply(); // "Minigames is thinking..."
    await interaction.editReply({ files: [await leaderboard.render(interaction.client)] });
}