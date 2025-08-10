const { ChatInputCommandInteraction, time, TimestampStyles, ActionRowBuilder, StringSelectMenuBuilder, Collection } = require("discord.js");
const { SlashCommandBuilder, Client } = require("discord.js");
const { generateEmbed, parseTimeString } = require("../utils/util");
const { insertReminder } = require("../utils/sql");

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
                setReminderCommand(client, interaction);
                break;
            default:
                listRemindersCommand(client, interaction);
                break;
        }
    }
}

function setReminderCommand(client, interaction) {
    let message = interaction.options.getString("message", true);
    let duration = interaction.options.getString("duration", true);

    let date = parseTimeString(duration);

    if (date == null) {
        interaction.editReply({
            title: "Error",
            description: "Invalid date string"
        })
        return;
    }

    interaction.editReply({
        embeds: [
            generateEmbed({
                title: "Reminder Set",
                description: "Your reminder is set to ring " + time(date, TimestampStyles.RelativeTime),
                fields: [{ name: "Content", value: message }]
            })
        ]
    })

    insertReminder(interaction.user.id, message, date).then(id => {
        let reminderObj = {
            userId: interaction.user.id, 
            message, 
            date
        }

        client.reminders.set(id, reminderObj);
    }).catch(err => {
        throw err;
    });
}

function listRemindersCommand(client, interaction) {
    let reminders = client.reminders.filter(r => r.userId == interaction.user.id)

    if (reminders == null || reminders.size == 0) {
        return interaction.editReply({
            embeds: [generateEmbed({
                title: "Error",
                description: "You do not have any reminders set."
            })]
        });
    }

    interaction.editReply({
        embeds: [
            generateEmbed({
                title: "Your Reminders",
                description: "You have a total of " + reminders.size + " reminders set\n\n" + reminders.map(r => {
                    return r.message + time(r.date, TimestampStyles.RelativeTime)
                }).join("\n")
            })
        ],
        components: [
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("deleteReminder")
                    .addOptions(reminders.map(r => {
                        return {
                            label: r.message,
                            value: r.message
                        }
                    }))
            )
        ]
    });
}