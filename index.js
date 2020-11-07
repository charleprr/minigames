const fs = require(`fs`);
const config = require(`./config.json`);
const bot = new (require(`./libs/bot.js`))(`!`, config.token, config.owner);

fs.readdir(`./games/`, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
        const game = require(`./games/${file}`);
        bot.games.push(game);
    });
});

bot.start();