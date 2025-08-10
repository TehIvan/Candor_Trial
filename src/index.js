const { Client, Partials, Collection } = require("discord.js");
const { loadCommands, loadEvents } = require("./utils/handler");
const { createTables, insertReminder, getReminders } = require("./utils/sql");
const { token } = require(process.cwd() + "/config/config.json");

const client = new Client({
    intents: ["Guilds", "GuildMembers", "GuildMessages"]
});

client.commands = new Collection();
client.reminders = new Collection();

(async() => {

    createTables();

    const reminders = await getReminders();

    for (let reminder of reminders) {
        client.reminders.set(reminder.id, {userId: reminder.user_id, message: reminder.message, date: reminder.date});
        console.log("Loaded reminder " + reminder.id);
    }

    await loadCommands(client);
    await loadEvents(client);

    try {
        client.login(token);
    } catch (err) {
        console.log("Unable to login");
        console.log(err);
    }
})();