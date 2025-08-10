const { Client } = require("discord.js");
const { deleteReminder } = require("../utils/sql");
const { generateEmbed } = require("../utils/util");

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {Client} client 
     * @param {import("discord.js").Interaction} interaction 
     */
    run: (client, interaction) => {

        if (interaction.isCommand()) {

            let name = interaction.commandName;
            let command = client.commands.get(name);

            if (command != null) command.run(client, interaction);
        }

        if (interaction.isStringSelectMenu()) {
            
            switch (interaction.customId) {
                case "deleteReminder":
                    client.reminders.delete(parseInt(interaction.values[0]));
                    deleteReminder(parseInt(interaction.values[0]));

                    interaction.reply({
                        flags: ["Ephemeral"],
                        embeds: [generateEmbed({
                            title: "Reminder deleted"
                        })]
                    })
                    break;
            }
        } 
    }
}