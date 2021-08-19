import { fillTextWithTwemoji } from "node-canvas-with-twemoji-and-discord-emoji";
import canvas from "canvas";
import fs from "fs";

export default class Leaderboard {

    constructor(name, unit="", higherFirst=true) {
        this.name = name;
        this.unit = unit;
        this.higherFirst = higherFirst;
        this.file = `database/${name.toLowerCase()}.json`;
        this.data = null;
    }

    read() {
        if (!fs.existsSync(this.file))
            fs.writeFileSync(this.file, "{}");
        return JSON.parse(fs.readFileSync(this.file));
    }

    write(data) {
        this.data = data;
        fs.writeFileSync(this.file, JSON.stringify(data, null, 2));
    }

    get currentScores() {
        if (!this.data) 
            this.data = this.read();
        return this.data;
    }

    add(member, score) {
        const savedScore = this.currentScores[member.id];
        if (this.higherFirst) {
            if (savedScore > score) return;
        } else {
            if (savedScore < score) return;
        }
        this.currentScores[member.id] = Number(score);
        this.write(this.currentScores);
    }

    async render(client) {

        const entries = Object.entries(this.currentScores).sort(
            (a, b) => this.higherFirst ? a[1] + b[1] : a[1] - b[1]);

        const image = canvas.createCanvas(700, 640);
        const ctx = image.getContext("2d");

        // Background
        ctx.fillStyle = "#FF5757";
        ctx.fillRect(0, 0, 700, 640);
        
        // Title
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";

        ctx.font = "bold 36px Courier New";
        ctx.fillText("/" + this.name, 350, 55);

        // Game die
        // ctx.drawImage(await canvas.loadImage("./images/game_die.png"), 575, 430, 200, 200);

        let x = 20;
        let y = 90;

        for (let i=0; i<10; ++i) {

            // Block
            if (i >= entries.length) {
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = "#FF7878";
                ctx.strokeStyle = "#FF7878";
            } else {
                ctx.fillStyle = "#FFFFFF";
                ctx.strokeStyle = "#FFFFFF";
            }
            ctx.lineWidth = 8;
            ctx.lineJoin = "round";
            ctx.fillRect(x, y + i*55, 660, 35);
            ctx.strokeRect(x-2, y-2 + i*55, 664, 39);

            if (i >= entries.length) continue;

            if (!await client.users.cache.get(entries[i][0])) {
                await client.users.fetch(entries[i][0]);
            }
            let player = await client.users.cache.get(entries[i][0]);

            if (i == 0) ctx.fillStyle = "#FFB404";
            else if (i == 1) ctx.fillStyle = "#COCOCO";
            else if (i == 2) ctx.fillStyle = "#CD7F32";
            else ctx.fillStyle = "#222222";

            // Rank
            ctx.font = "bold 24px Courier New";
            ctx.textAlign = "left";
            ctx.fillText(`#${i + 1}`, x+10, y+27 + i*55);
            let w = ctx.measureText(`#${i + 1}`);

            // Player score
            ctx.font = "bold 24px Courier New";
            ctx.textAlign = "right";
            ctx.fillText(entries[i][1].toFixed(3) + this.unit, x+652, y+27 + i*55);
            
            // Player avatar
            const ap = {
                size: 30,
                x: x+70,
                y: y+3 + i*55
            };

            ctx.save();
            ctx.beginPath();
            ctx.arc(ap.x+(ap.size/2), ap.y+(ap.size/2), ap.size/2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
        
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(ap.x, ap.y, ap.size, ap.size);
            ctx.drawImage(await canvas.loadImage(player.displayAvatarURL({ format:"png" })), ap.x, ap.y, ap.size, ap.size);
        
            ctx.beginPath();
            ctx.arc(ap.x+(ap.size/2), ap.y+(ap.size/2), ap.size/2, 0, Math.PI * 2, true);
            ctx.clip();
            ctx.closePath();
            ctx.restore();

            // Player name
            ctx.font = "24px Courier New";
            ctx.textAlign = "left";
            ctx.fillStyle = "#222222";
            await fillTextWithTwemoji(ctx, player.username, x+50+60, y+27 + i*55);
        }
        
        return image.toBuffer();
    }

    reset() {
        fs.unlinkSync(this.file);
    }

};