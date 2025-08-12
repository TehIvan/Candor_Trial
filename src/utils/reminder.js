const { time, TimestampStyles, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const { generateEmbed, parseTimeString } = require("../utils/util");
const { insertReminder, deleteReminder } = require("../utils/sql");

function setReminder(client, interaction) {
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

function listReminders(client, interaction) {
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
                description: "You have a total of " + reminders.size + " reminders set\n\n" + reminders.map((r, i) => {
                    return `**${i}**. ${r.message} ${time(r.date, TimestampStyles.RelativeTime)}`
                }).join("\n")
            })
        ],
        components: [
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("deleteReminder")
                    .setPlaceholder("Delete Reminder")
                    .addOptions(reminders.map((r, i) => {
                        return {
                            label: `#${i}. ${r.message}`,
                            value: `${i}`
                        }
                    }))
            )
        ]
    });
}

function reminderTask(client) {
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
}

function removeReminder(client, interaction) {
    client.reminders.delete(parseInt(interaction.values[0]));
    deleteReminder(parseInt(interaction.values[0]));

    interaction.reply({
        flags: ["Ephemeral"],
        embeds: [generateEmbed({
            title: "Reminder deleted"
        })]
    })
}

module.exports = {
    setReminder, listReminders, reminderTask, removeReminder
}