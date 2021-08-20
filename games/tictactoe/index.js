import Discord from "discord.js";

// TODO: Clean this mess
export const name = "tictactoe";
export const description = "Play tic-tac-toe against someone!";
export const options = [{
    name: "opponent",
    type: "USER",
    description: "Who do you want to play against?",
    required: true
}];

function isDraw(board) {
    for (let x=0; x<3; ++x) {
        if (board[x].includes(0)) return false;
    }
    return true;
}

function hasWinner(board, p1, p2) {
    for (let x=0; x<3; ++x) {
        // Row winner
        if (JSON.stringify(board[x]) == "[1,1,1]")
            return p1;
        if (JSON.stringify(board[x]) == "[2,2,2]")
            return p2;
        // Column winner
        if (board[0][x] == board[1][x] && board[1][x] == board[2][x] && board[0][x] != 0) {
            if (board[0][x] == 1)
                return p1;
            if (board[x][0] == 2)
                return p2;
        }
    }

    // Diagonal winner
    if ((board[0][0] == board[1][1] && board[1][1] == board[2][2])
     || (board[2][0] == board[1][1] && board[1][1] == board[0][2])
     && (board[1][1] != 0)) {
        if (board[0][0] == 1)
            return p1;
        if (board[0][0] == 2)
            return p2;
    }
}

function disableBoard(boardButtons) {
    for (const row of boardButtons) {
        for (const button of row.components) {
            button.setDisabled(true);
        }
    }
}

async function challenge(interaction, player, gameId, boardButtons) {
    const accept = new Discord.MessageButton();
    accept.setCustomId(gameId + "_accept");
    accept.setStyle("SUCCESS");
    accept.setLabel("Accept");
    const deny = new Discord.MessageButton();
    deny.setCustomId(gameId + "_deny");
    deny.setStyle("DANGER");
    deny.setLabel("Deny");
    const answerButtons = new Discord.MessageActionRow().addComponents(accept, deny);
    await interaction.reply({
        content: "<@"+player.id+">, you have been challenged to a game of tic-tac-toe.",
        components: [answerButtons]
    });
    return new Promise(resolve => {
        const waitForAnswer = i => {
            if (!i.customId?.startsWith(gameId)) return;
            if (i.member.id == player.id) {
                if (i.customId?.includes("accept")) {
                    i.update({
                        content: "<@"+player.id+">, please make the first move." ,
                        components: boardButtons
                    });
                    resolve(true);
                } else resolve(false);
                interaction.client.removeListener("interactionCreate", waitForAnswer);
            }
        }
        interaction.client.on("interactionCreate", waitForAnswer);
    });
}

export async function execute (interaction) {

    const gameId = Math.random().toString();
    const p2 = interaction.member;
    const p1 = await interaction.guild.members.cache.get(interaction.options.get("opponent").user.id);

    if (p2.id == p1.id) {
        return interaction.reply("You cannot play against yourself");
    } else if (p1.user.bot) {
        return interaction.reply("You cannot play against bots");
    }

    // Create the board
    const boardButtons = [];
    const board = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    let nextTurn = "X";

    for (let x=0; x<3; ++x) {
        boardButtons[x] = new Discord.MessageActionRow();
        for (let y=0; y<3; ++y) {
            const b = new Discord.MessageButton();
            b.setCustomId(gameId + "_" + x + "_" + y);
            b.setStyle("SECONDARY");
            b.setLabel("-");
            boardButtons[x].addComponents(b);
        }
    }
    
    // Challenge the opponent
    const accepted = await challenge(interaction, p1, gameId, boardButtons);
    if (!accepted) {
        return interaction.editReply({ content: "Challenge denied.", components: [] });
    }

    // Play your turn
    const play = async i => {
        if (!i.customId?.startsWith(gameId)) return;

        const x = Number(i.customId?.split("_")?.[1]);
        const y = Number(i.customId?.split("_")?.[2]);
        if (isNaN(x) || isNaN(y)) return;

        const button = boardButtons[x].components[y];
        if (button.style != "SECONDARY") return;

        if (nextTurn == "X" && i.member.id == p1.id) {
            board[x][y] = 1;
            button.setStyle("PRIMARY");
            button.setLabel("X");
            button.setDisabled(true);
            nextTurn = "O";
        } else if (nextTurn == "O" && i.member.id == p2.id) {
            board[x][y] = 2;
            button.setStyle("DANGER")
            button.setLabel("O");
            button.setDisabled(true);
            nextTurn = "X";
        } else return;

        if (isDraw(board)) {
            disableBoard(boardButtons);
            await i.update({ content: "It's a draw!", components: boardButtons });
            return interaction.client.removeListener("interactionCreate", play);
        }
        
        let winner = hasWinner(board, p1, p2);
        if (winner) {
            disableBoard(boardButtons);
            await i.update({ content: "<@" + winner.id + "> won!", components: boardButtons });
            return interaction.client.removeListener("interactionCreate", play);
        }

        await i.update({ content: "<@" + (nextTurn == "X" ? p1.id : p2.id) + ">", components: boardButtons });        
    }

    // Listen for button clicks
    interaction.client.on("interactionCreate", play);
};