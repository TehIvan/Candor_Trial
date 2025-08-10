const { Client, Partials, Collection } = require("discord.js");
const { loadCommands, loadEvents } = require("./utils/handler");
const { token } = require(process.cwd() + "/config/config.json");

const client = new Client({
    intents: ["Guilds", "GuildMembers", "GuildMessages"],
    partials: [Partials.Channel, Partials.Message, Partials.GuildMember]
});

client.commands = new Collection();

(async() => {

    await loadCommands(client);
    await loadEvents(client);

    try {
        client.login(token);
    } catch (err) {
        console.log("Unable to login");
        console.log(err);
    }
})();