const { ChatInputCommandInteraction } = require("discord.js");
const { SlashCommandBuilder, Client } = require("discord.js");
const { setReminder, listReminders } = require("../utils/reminder");

module.exports = {
    info: new SlashCommandBuilder()
        .setName("reminder")
        .setDescription(".")
        .addSubcommand(
            r => r.setName("set").setDescription("Set a reminder")
                .addStringOption(
                    s => s.setName("message").setDescription("What do you want me to remind you of?").setRequired(true)
                )
                .addStringOption(
                    s => s.setName("duration").setDescription("In how much time should I send you this reminder? Relative format").setRequired(true)
                )
        )
        .addSubcommand(
            r => r.setName("delete").setDescription("List and delete reminders")
        )
        .addSubcommand(
            r => r.setName("list").setDescription("View the reminders you have set")
        )
        .toJSON(),
    /**
     * 
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async function (client, interaction) {
        let subcommand = interaction.options.getSubcommand(true);

        await interaction.deferReply({
            flags: ["Ephemeral"]
        });

        switch (subcommand) {
            case "set":
                setReminder(client, interaction);
                break;
            default:
                listReminders(client, interaction);
                break;
        }
    }
}