const { MessageEmbed } = require(`discord.js`);
const fs = require(`fs`);

/**
 * Gets the saved data
 * for a given guild ID.
 */
function get (id, game) {
    const file = `database/${id}.json`;
    let save;
    if (fs.existsSync(file)) {
        save = JSON.parse(fs.readFileSync(file));
        if (!save[game]) save[game] = [];
    } else save = {[game]: []};
    fs.writeFileSync(file, JSON.stringify(save, null, 4));
    return save;
}

/**
 * Makes and returns the leaderboard embed
 * message for a given guild ID and game.
 */
module.exports.make = (id, game) => {
    const leaderboard = get(id, game)[game];
    const awards = ["🥇", "🥈", "🥉"];
    let str = "";
    for (let i=0; i<3; ++i) {
        if (leaderboard[i]) {
            str += `${awards[i]} \`${leaderboard[i].score.toFixed(3)}s\` `;
            str += `by <@${leaderboard[i].player}>\n`;
        } else {
            str += `${awards[i]} -\n`;
        }
    }
    return new MessageEmbed().setColor('#F44239').addField(`Current leaderboard`, str);
};

/**
 * Updates the correponsding leaderboard
 * if a highscore has been beaten.
 */
module.exports.register = (id, game, entry) => {
    let save = get(id, game);
    let leaderboard = save[game];
    let existingEntry = leaderboard.find(e => e.player === entry.player);
    if (!existingEntry) {
        leaderboard.push(entry);
    } else if (entry.score < existingEntry.score) {
        existingEntry.score = entry.score;
    }
    leaderboard = leaderboard.sort((a, b) => a.score - b.score);
    leaderboard.splice(3);
    save[game] = leaderboard;
    fs.writeFileSync(`database/${id}.json`, JSON.stringify(save, null, 4));
};
