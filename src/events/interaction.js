const { Client } = require("discord.js");

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {Client} client 
     * @param {import("discord.js").Interaction} interaction 
     */
    run: (client, interaction) => {

        if (!interaction.isCommand()) return;

        let name = interaction.commandName;
        let command = client.commands.get(name);
        
        if (command != null) command.run(client, interaction);
    }
}