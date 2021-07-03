// Minigames configuration
const config = require("./config.json");

// Create a new Bot
let bot = new Bot("!", config.discordToken);


bot.start();
