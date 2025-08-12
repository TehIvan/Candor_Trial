const { SlashCommandBuilder, ButtonStyle } = require("discord.js");
const { generateEmbed } = require("../utils/util");
const { ActionRowBuilder } = require("@discordjs/builders");
const { ButtonBuilder } = require("@discordjs/builders");
const { createCustomCommand, listCustomCommands } = require("../utils/customCommand");

module.exports = {
    info: new SlashCommandBuilder()
        .setName("command")
        .setDescription("a")
        .addSubcommand(r => r.setName("create").setDescription("Create a subcommand"))
        .addSubcommand(r => r.setName("list").setDescription("List commands"))
        .addSubcommand(r => r.setName("delete").setDescription("Delete a command"))
        .toJSON(),
    run: (client, interaction) => {
        const subcommand = interaction.options.getSubcommand(true);

        switch (subcommand) {
            case "create":
                createCustomCommand(interaction)
                break;
            default:
                listCustomCommands(interaction);
                break;
        }
    }
}