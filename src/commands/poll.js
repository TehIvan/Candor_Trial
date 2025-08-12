const { SlashCommandBuilder, ChatInputCommandInteraction, Client } = require("discord.js");
const { handlePollCreation } = require("../utils/poll");

module.exports = {
    info: new SlashCommandBuilder()
        .setName("poll")
        .setDescription(".")
        .addStringOption(s => s.setName("question").setDescription("The question for the poll").setRequired(true))
        .addStringOption(s => s.setName("duration").setDescription("How long should the poll last").setRequired(true))
        .addStringOption(s => s.setName("options").setDescription("Seperate using |").setRequired(true))
        .addChannelOption(s => s.setName("channel").setDescription("Defaults to configured channel"))
        .toJSON(),
    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        handlePollCreation(client, interaction);
    }
}