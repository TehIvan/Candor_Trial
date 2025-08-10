const { Client, Collection } = require("discord.js");
const { deleteReminder } = require("../utils/sql");
const { generateEmbed } = require("../utils/util");
const { guildId } = require(process.cwd() + "/config/config.json");

module.exports = {
    name: "ready",

    /**
     * 
     * @param {Client} client 
     */
    run: async (client) => {

        console.log("\nLogged in as " + client.user.tag + "\n");

        try {
            let guild = await client.guilds.fetch(guildId);

            console.log("Attempting to register commands.");

            for (let command of client.commands.values()) {
                guild.commands.create(command.info)
                .then(() => {
                    console.log("Registered command: " + command.info.name);
                })
                .catch(() => {
                    console.log("Failed to register command: " + command.info.name);
                }); 
            }
        } catch (err) {
            console.log("Could not find guild.");
            process.exit();
        }

        console.log("\nStarting Tasks\n")
        setInterval(() => {
            let currentDate = new Date()
            client.reminders.filter(
                r => currentDate >= r.date
            ).forEach((reminder, id) => {
                client.users.fetch(reminder.userId).then(user => {
                    user.send({
                        embeds: [
                            generateEmbed({
                                title: "Reminder",
                                description: reminder.message
                            })
                        ]
                    })

                    client.reminders.delete(id);
                    deleteReminder(id);
                }).catch(err => {
                    console.log("Failed to fetch user for reminder ID " + id)
                    console.log(err);
                })
            })
        }, 60 * 1000);
    }
}