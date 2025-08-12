const { Client, TimestampStyles, time, SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ComponentType } = require("discord.js");
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

        if (interaction.isButton()) {
            switch (interaction.customId) {
                case "setTextContent":
                    await interaction.showModal(new ModalBuilder().setTitle("Enter your message content").addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder().setCustomId("content").setStyle(TextInputStyle.Paragraph).setLabel("Content").setRequired(true)
                        )
                    ).setCustomId("content"));

                    let res = await interaction.awaitModalSubmit({
                        time: 60 * 1000 * 30
                    });

                    res.deferUpdate();

                    interaction.message.edit(res.fields.getTextInputValue("content"));
                    break;
                case "finishCommand":
                    let obj = {};

                    if (interaction.message.content != null) obj["content"] = interaction.message.content;
                    if (interaction.message.embeds.length > 0) obj["embeds"] = interaction.message.embeds;

                    if (Object.keys(obj).length == 0) {
                        return interaction.reply({
                            flags: ["Ephemeral"],
                            embeds: [generateEmbed({
                                title: "Please enter details"
                            })]
                        })
                    }

                    await interaction.showModal(new ModalBuilder().setTitle("Enter your command details").addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder().setCustomId("name").setStyle(TextInputStyle.Short).setLabel("Command Name").setRequired(true)
                        ),
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder().setCustomId("description").setStyle(TextInputStyle.Short).setLabel("Command Description").setRequired(true)
                        )
                    ).setCustomId("command"));

                    let r = await interaction.awaitModalSubmit({
                        time: 60 * 1000 * 30
                    });

                    let name = r.fields.getTextInputValue("name");
                    let description = r.fields.getTextInputValue("description");

                    let command = {
                        name, description, response: obj
                    }

                    interaction.message.delete();
                    r.reply({
                        flags: ["Ephemeral"],
                        embeds: [generateEmbed({
                            title: "Command created"
                        })]
                    });


                    client.commands.set(command.name, {
                        isCustom: true,
                        info: new SlashCommandBuilder()
                            .setName(command.name)
                            .setDescription(command.description)
                            .toJSON(),
                        run: (client, interaction) => interaction.reply(command.response)
                    })

                    await interaction.guild.commands.create(new SlashCommandBuilder()
                            .setName(command.name)
                            .setDescription(command.description)
                            .toJSON());
                    break;
            }
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