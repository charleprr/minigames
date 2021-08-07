import canvas from "canvas";
import fs from "fs";

export class Leaderboard {

    constructor(name, higherFirst=true) {
        this.name = name;
        this.file = `database/${name.toLowerCase()}.json`;
        this.higherFirst = higherFirst;
    }

    getAll() {
        if (!fs.existsSync(this.file)) {
            fs.writeFileSync(this.file, "[]");
        }
        return JSON.parse(fs.readFileSync(this.file));
    }

    get(playerId) {
        return this.getAll().find(e => e.playerId == playerId);
    }

    add(member, score) {
        let entries = this.getAll();

        if (this.higherFirst) {
            if (this.get(member.id)?.score.value > score.value) return;
        } else {
            if (this.get(member.id)?.score.value < score.value) return;
        }

        this.remove(member.id);
        entries = this.getAll();
        
        entries.push({
            playerId: member.id,
            playerName: member.displayName,
            playerAvatar: member.user.displayAvatarURL({ format:"png" }),
            guildName: member.guild.name,
            score: {
                value: score.value,
                unit: score.unit || ""
            }
        });
        entries.sort((a, b) => this.higherFirst ? a.score.value + b.score.value : a.score.value - b.score.value);
        fs.writeFileSync(this.file, JSON.stringify(entries, null, 4));
    }

    remove(playerId) {
        const entries = this.getAll().filter(e => e.playerId != playerId);
        fs.writeFileSync(this.file, JSON.stringify(entries, null, 4));
    }

    async render() {
        const entries = this.getAll();

        const image = canvas.createCanvas(700, 640);
        const ctx = image.getContext("2d");

        // Background
        ctx.fillStyle = "#FF5757";
        ctx.fillRect(0, 0, 700, 640);
        
        // Title
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";

        ctx.font = "bold 32px Courier New";
        ctx.fillText("/" + this.name, 350, 40);

        // ctx.font = "bold 20px Courier New";
        // ctx.fillText("Bottom text", 350, 65);

        // Controller
        // ctx.globalAlpha = 0.5;
        // ctx.drawImage(await canvas.loadImage("./images/controller.png"), 500, 335, 250, 250);
        // ctx.globalAlpha = 1;

        let x = 20;
        let y = 90;

        for (let i=0; i<10; ++i) {
            

            // Block
            if (i >= entries.length) {
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = "#ff7878";
                ctx.strokeStyle = "#ff7878";
            } else {
                ctx.fillStyle = "#FFFFFF";
                ctx.strokeStyle = "#FFFFFF";
            }
            ctx.lineWidth = 8;
            ctx.lineJoin = "round";
            ctx.fillRect(x, y + i*55, 660, 35);
            ctx.strokeRect(x-2, y-2 + i*55, 664, 39);

            if (i >= entries.length) continue;

            if (i == 0) ctx.fillStyle = "#C98910";
            else if (i == 1) ctx.fillStyle = "#A8A8A8";
            else if (i == 2) ctx.fillStyle = "#965A38";
            else ctx.fillStyle = "#222222";

            // Rank
            ctx.font = "bold 24px Courier New";
            ctx.textAlign = "left";
            ctx.fillText(`#${i + 1}`, x+10, y+27 + i*55);

            // Player score
            ctx.font = "bold 24px Courier New";
            ctx.textAlign = "right";
            ctx.fillText(entries[i].score.value + entries[i].score.unit, x+652, y+27 + i*55);
            
            // Player avatar
            const ap = {
                size: 30,
                x: x+50,
                y: y+3 + i*55
            };

            ctx.save();
            ctx.beginPath();
            ctx.arc(ap.x+(ap.size/2), ap.y+(ap.size/2), ap.size/2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
        
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(ap.x, ap.y, ap.size, ap.size);
            ctx.drawImage(await canvas.loadImage(entries[i].playerAvatar), ap.x, ap.y, ap.size, ap.size);
        
            ctx.beginPath();
            ctx.arc(ap.x+(ap.size/2), ap.y+(ap.size/2), ap.size/2, 0, Math.PI * 2, true);
            ctx.clip();
            ctx.closePath();
            ctx.restore();

            // Player name
            ctx.font = "24px Courier New";
            ctx.textAlign = "left";
            ctx.fillStyle = "#222222";
            ctx.fillText(entries[i].playerName, x+50+40, y+27 + i*55);
        
        }
        
        return image.toBuffer();
    }

    reset() {
        fs.unlinkSync(this.file);
    }

};