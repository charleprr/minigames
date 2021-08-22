import { MessageActionRow, MessageButton } from "discord.js";


class Board {

    constructor () {
        this.cells = new Array(9).fill(" ");
        this.lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        this.turn = "X";
    }

    play (cell) {
        this.cells[cell] = this.turn;
        this.turn = this.turn === "X" ? "O" : "X";
    }

    isDraw () {
        return !this.cells.includes(" ") && !this.hasWinner();
    }

    hasWinner () {
        for (const turn of ["X", "O"]) {
            for (const line of this.lines) {
                if (this.cells[line[0]] === this.cells[line[1]]
                    && this.cells[line[1]] === this.cells[line[2]]
                    && this.cells[line[2]] === turn) {
                    return turn;
                }
            }
        }
        return false;
    }

}

export default class Tictactoe {

    constructor (playerX, playerO) {
        this.id = Math.random().toString();
        this.board = new Board();
        this.players = { "X": playerX, "O": playerO };
    }

    async start (interaction) {
        interaction.editReply({ content: `<@${this.players[this.board.turn].id}>, make the first move.`, components: this.toComponents() });

        const filter = i => i.customId.startsWith(this.id)
            && (i.member.id === this.players["X"].id
            || i.member.id === this.players["O"].id);

        const collector = (await interaction.fetchReply()).createMessageComponentCollector({ filter, time: 15*60*1000 });
        collector.on("collect", i => {

            if (i.member.id !== this.players[this.board.turn].id)
                return;

            this.board.play(Number(i.customId.split(";")[1]));

            if (this.board.isDraw()) {
                i.update({ content: "Draw.", components: this.toComponents(true) });
            } else if (this.board.hasWinner()) {
                i.update({ content: `**${this.players[this.board.hasWinner()].displayName}** won!`, components: this.toComponents(true) });
            } else {
                i.update({ content: `<@${this.players[this.board.turn].id}>, your turn.`, components: this.toComponents() });
            }
        });
    }

    toComponents (disabled) {
        const components = [];
        for (let i=0; i<3; i++) {
            components[i] = new MessageActionRow();
            for (let j=0; j<3; j++) {
                components[i].addComponents(
                    new MessageButton()
                        .setCustomId(`${this.id};${i*3+j}`)
                        .setStyle("SECONDARY")
                        .setLabel(this.board.cells[i*3+j])
                        .setDisabled(disabled || (!disabled && this.board.cells[i*3+j] !== " "))
                );
            }
        }
        return components;
    }

}