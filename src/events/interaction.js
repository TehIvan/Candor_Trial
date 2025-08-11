const { Client, TimestampStyles, time, SlashCommandBuilder } = require("discord.js");
const { deleteReminder, insertVote } = require("../utils/sql");
const { generateEmbed } = require("../utils/util");
const customCommands = require(process.cwd() + "/config/custom_commands.json");
const { writeFile } = require('fs/promises');

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

        if (interaction.isStringSelectMenu()) {

            if (interaction.customId.startsWith('votePoll_')) {
                let id = interaction.customId.split("_")[1];
                let poll = client.polls.get(parseInt(id));

                if (poll == null) return;

                interaction.deferUpdate();

                let vote = interaction.values[0];
                let votes = client.votes.get(parseInt(id)) ?? [];

                if (votes.length > 0 && votes.find(r => r.userId == interaction.user.id)) {
                    interaction.reply({
                        flags: ["Ephemeral"],
                        embeds: [
                            generateEmbed({
                                title: "You can only vote once!"
                            })
                        ]
                    })
                    return;
                }

                votes.push(
                    { userId: interaction.user.id, vote }
                );

                interaction.message.edit({
                    embeds: [
                        generateEmbed({
                            title: poll.question,
                            description: `Ends ${time(poll.date, TimestampStyles.RelativeTime)}\n\n` + poll.options.map((r, i) => {
                                return `**${r}** - ${votes.filter(a => a.vote == i).length} (${(votes.filter(a => a.vote == i).length / votes.length * 100)}%)`
                            }).join("\n")
                        })
                    ]
                })

                client.votes.set(id, votes);
                insertVote(id, vote, interaction.user.id);
            }

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