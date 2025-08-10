require("dotenv").config(process.cwd() + "/.env");

const { Client, Collection } = require("discord.js");
const { loadCommands, loadEvents } = require("./utils/handler");
const { createTables, insertReminder, getReminders, getPolls, getVotes } = require("./utils/sql");

const client = new Client({
    intents: ["Guilds", "GuildMembers", "GuildMessages"]
});

client.commands = new Collection();
client.reminders = new Collection();
client.polls = new Collection();
client.votes = new Collection();

(async() => {

    await createTables();

    const reminders = await getReminders();

    for (let reminder of reminders) {
        client.reminders.set(reminder.id, {userId: reminder.userId, message: reminder.message, date: reminder.date});
        console.log("Loaded reminder " + reminder.id);
    }

    const polls = await getPolls();

    for (let poll of polls) {
        client.votes.set(poll.id, []);
        client.polls.set(poll.id, {channelId: poll.channelId, messageId: poll.messageId, question: poll.question, options: poll.options.split("|"), date: poll.date})
    }

    const votes = await getVotes();

    for (let vote of votes) {
        client.votes.set(vote.pollId, (client.votes.get(vote.pollId) ?? []).concat([{userId: vote.userId,  vote: vote.vote}]))
    }

    await loadCommands(client);
    await loadEvents(client);

    try {
        client.login(process.env.TOKEN);
    } catch (err) {
        console.log("Unable to login");
        console.log(err);
    }
})();