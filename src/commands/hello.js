const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    info: new SlashCommandBuilder()
        .setName("hello")
        .setDescription("Echoes hello!")
        .toJSON(),
    run: async function(client, interaction) {
        interaction.reply("Hello");
    }
}