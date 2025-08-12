const { Client } = require("discord.js");
const { generateEmbed } = require("../utils/util");
const { removeReminder } = require("../utils/reminder");
const { handleVote } = require("../utils/poll");
const { setTextContent, finishCreation, addEmbed, deleteCustomCommand } = require("../utils/customCommand");

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {Client} client 
     * @param {import("discord.js").Interaction} interaction 
     */
    run: async (client, interaction) => {

        if (interaction.isCommand()) {

            let name = interaction.commandName;
            let command = client.commands.get(name);

            if (command != null) command.run(client, interaction);
        }

        if (interaction.isButton()) {
            switch (interaction.customId) {
                case "setTextContent":
                    setTextContent(interaction);
                    break;
                case "addEmbed":
                    addEmbed(interaction);
                    break;
                case "finishCommand":
                    finishCreation(client, interaction);
                    break;
            }
        }

        if (interaction.isStringSelectMenu()) {

            if (interaction.customId.startsWith('votePoll_')) {
                handleVote(client, interaction);
            }

            switch (interaction.customId) {
                case "deleteReminder":
                    removeReminder(client, interaction);
                    break;
                case "deleteCommand":
                    deleteCustomCommand(client, interaction);
                    break;
            }
        }
    }
}