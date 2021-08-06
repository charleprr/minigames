import fs from "fs";

/**
 * Create and manage leaderboards
 * (assuming the lower the score the better for now)
 */
export class Leaderboard {

    constructor(name, higherFirst=true) {
        this.file = `database/${name.toLowerCase()}.json`;
        this.higherFirst = higherFirst;
    }

    save(user, score) {
        // Create a leaderboard, if it doesn't exist
        if (!fs.existsSync(this.file)) {
            fs.writeFileSync(this.file, "[]");
        }

        // Read and update the scores
        const scores = new Map(JSON.parse(fs.readFileSync(this.file)));
        if (this.higherFirst) {
            if (scores.get(user.id)?.score > score) return;
        } else {
            if (scores.get(user.id)?.score < score) return;
        }
        scores.set(user.id, {
            username: user.username,
            score: score
        });

        // Save it
        fs.writeFileSync(this.file, JSON.stringify([...scores], null, 4));
    }

    reset() { fs.unlinkSync(this.file); }
};