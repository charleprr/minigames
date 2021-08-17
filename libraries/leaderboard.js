import { fillTextWithTwemoji } from "node-canvas-with-twemoji-and-discord-emoji";
import canvas from "canvas";
import fs from "fs";

export default class Leaderboard {

    constructor(name, higherFirst=true) {
        this.name = name;
        this.file = `database/${name.toLowerCase()}.json`;
        this.higherFirst = higherFirst;
        this.data = null;
    }

    read() {
        if (!fs.existsSync(this.file)) {
            fs.writeFileSync(this.file, "[]");
        }
        return new Map(JSON.parse(fs.readFileSync(this.file)));
    }

    write(data) {
        this.data = data;
        fs.writeFileSync(this.file, JSON.stringify([...data], null, 2));
    }

    get currentScores() {
        if (!this.data) 
            this.data = this.read();
        return this.data;
    }

    add(member, score) {

        let playerEntry = this.currentScores.get(member.id);
        // console.log("playerEntry: " + playerEntry?.score.value);

        if (this.higherFirst) {
            if (playerEntry?.score.value > score.value) return;
        } else {
            // console.log("testing");
            if (playerEntry?.score.value < score.value) return;
        }

        // console.log("updating his score: "+ score.value);
        let newData = this.currentScores;

        newData.set(member.id, {
            playerId: member.id,
            playerName: member.displayName,
            playerAvatar: member.user.displayAvatarURL({ format: "png" }),
            guildName: member.guild.name,
            score: {
                value: Number(score.value),
                unit: score.unit || ""
            }
        });

        this.write(newData);
    }

    async render(client) {

        let entries = Array.from(this.currentScores.values());
        entries = entries.sort((a, b) => this.higherFirst
            ? a.score.value + b.score.value
            : a.score.value - b.score.value);

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

            if (!await client.users.cache.get(entries[i].playerId)) {
                await client.users.fetch(entries[i].playerId);
            }
            let player = await client.users.cache.get(entries[i].playerId);

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
            ctx.fillText(entries[i].score.value.toFixed(3) + entries[i].score.unit, x+652, y+27 + i*55);
            
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