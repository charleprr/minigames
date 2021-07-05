# Controller
A Discord bot full (work in progress) of chat games!

## Add more games
Adding new games is quite simple.
1. Create a new game file in `commands/mygame.js`
2. Use this template

```js
module.exports = {
    name: "mygame", // This name will be the command name
    description: "My awesome new game"
};

module.exports.execute = (done) => {
    /**
     * Write your game's
     * code here
     */
    done(); // Call done() when the game is over
}
```
q
Feel free to create a pull request to add games.

## Configuration
Create a `config.json` file including your bot's token.

```json
{
    "token": "YOUR_DISCORD_BOT_TOKEN"
}
```

## Run
```bash
$ npm install
$ npm start
```