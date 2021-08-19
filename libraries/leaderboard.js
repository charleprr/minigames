import { fillTextWithTwemoji } from "node-canvas-with-twemoji-and-discord-emoji";
import canvas from "canvas";
import fs from "fs";

export default class Leaderboard {

    constructor(game, desc = true, unit = "") {
        this.game = game; // Game name
        this.unit = unit; // Score units
        this.desc = desc; // Descending order
        this.file = `database/${game.toLowerCase()}.json`;
        if (!fs.existsSync("database"))
            fs.mkdirSync("database");
        this.cache = null;
    }

    // Private methods

    _read() {
        if (!fs.existsSync(this.file))
            fs.writeFileSync(this.file, "{}");
        return JSON.parse(fs.readFileSync(this.file));
    }

    _write(data) {
        this.cache = data;
        fs.writeFileSync(this.file, JSON.stringify(data, null, 2));
    }

    _delete() {
        this.cache = null;
        fs.unlinkSync(this.file);
    }

    get _data() {
        if (!this.cache)
            this.cache = this._read();
        return this.cache;
    }

    // Public methods

    add(player, score) {
        const savedScore = this._data[player.id];
        if (this.desc ? savedScore >= score : savedScore <= score)
            return;
        this._data[player.id] = Number(score);
        this._write(this._data);
    }

    toSortedArray() {
        if (!this.cache)
            this.cache = this._read();
        return Object.entries(this.cache)
            .sort((a, b) => this.desc ? a[1] + b[1] : a[1] - b[1])
            .map(e => Object({ id: e[0], score: e[1] }));
    }

    async render(client) {

        const width = 700, height = 640;
        const image = canvas.createCanvas(width, height);
        const ctx = image.getContext("2d");

        // Red background
        ctx.fillStyle = "#FF5757";
        ctx.fillRect(0, 0, width, height);

        // Game name
        ctx.textAlign = "center";
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 36px Courier New";
        ctx.fillText("/" + this.game, 350, 55);

        const x = 20;
        const y = 90;
        const highscores = this.toSortedArray();

        for (let i = 0; i < 10; ++i) {

            // White card
            if (i < highscores.length) {
                ctx.fillStyle = "#FFFFFF";
                ctx.strokeStyle = "#FFFFFF";
            } else {
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = "#FF7878";
                ctx.strokeStyle = "#FF7878";
            }
            ctx.lineWidth = 8;
            ctx.lineJoin = "round";
            ctx.fillRect(x, y + i * 55, 660, 35);
            ctx.strokeRect(x - 2, y - 2 + i * 55, 664, 39);

            // Stop if no more highscores
            if (i >= highscores.length) continue;

            // Fetch player
            if (!await client.users.cache.get(highscores[i].id)) {
                await client.users.fetch(highscores[i].id);
            }
            let player = await client.users.cache.get(highscores[i].id);

            // Rank
            if (i == 0) ctx.fillStyle = "#FFB404";
            else if (i == 1) ctx.fillStyle = "#COCOCO";
            else if (i == 2) ctx.fillStyle = "#CD7F32";
            else ctx.fillStyle = "#222222";
            ctx.textAlign = "left";
            ctx.font = "bold 24px Courier New";
            ctx.fillText(`#${i + 1}`, x + 10, y + 27 + i * 55);

            // Score
            ctx.font = "bold 24px Courier New";
            ctx.textAlign = "right";
            ctx.fillText(highscores[i].score.toFixed(3) + this.unit, x + 652, y + 27 + i * 55);

            // Avatar
            const ap = {
                size: 30,
                x: x + 70,
                y: y + 3 + i * 55
            };
            ctx.save();
            ctx.beginPath();
            ctx.arc(ap.x + (ap.size / 2), ap.y + (ap.size / 2), ap.size / 2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(ap.x, ap.y, ap.size, ap.size);
            ctx.drawImage(await canvas.loadImage(player.displayAvatarURL({ format: "png" })), ap.x, ap.y, ap.size, ap.size);
            ctx.beginPath();
            ctx.arc(ap.x + (ap.size / 2), ap.y + (ap.size / 2), ap.size / 2, 0, Math.PI * 2, true);
            ctx.clip();
            ctx.closePath();
            ctx.restore();

            // Name
            ctx.font = "24px Courier New";
            ctx.textAlign = "left";
            ctx.fillStyle = "#222222";
            await fillTextWithTwemoji(ctx, player.username, x + 50 + 60, y + 27 + i * 55);
        }

        return image.toBuffer();
    }

};