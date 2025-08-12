const { Client } = require("discord.js");
const { pollTask } = require("../utils/poll");
const { reminderTask } = require("../utils/reminder");
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
            reminderTask(client);
            pollTask(client);
        }, 60 * 1000);
    }
}