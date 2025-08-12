const { ActionRowBuilder, StringSelectMenuBuilder, time, TimestampStyles } = require("discord.js");
const { parseTimeString, generateEmbed } = require("../utils/util");
const { insertPoll, insertVote, deletePoll, deleteVote } = require("../utils/sql");
const { pollsChannelId } = require(process.cwd() + '/config/config.json')

async function handlePollCreation(client, interaction) {
    
        interaction.deferReply({
            flags: ["Ephemeral"]
        })

        let question = interaction.options.getString("question", true);
        let duration = interaction.options.getString("duration", true);
        let options = interaction.options.getString("options", true);
        let channel = interaction.options.getChannel("channel", false);

        if (channel == null) channel = interaction.guild.channels.cache.get(pollsChannelId);

        let date = parseTimeString(duration);

        if (date == null) {
            return interaction.editReply({
                embeds: [generateEmbed({
                    title: "Error",
                    description: "Please mention a valid duration"
                })]
            })
        }

        let arr = options.split("|");

        const msg = await channel.send({
            embeds: [
                generateEmbed({
                    title: question
                })
            ]
        });

        interaction.editReply({
            embeds: [generateEmbed({
                title: "Posted",
                description: "Please find your poll at " + msg.url
            })]
        })

        insertPoll(channel, msg, question, options, date).then(id => {
            client.polls.set(id, {channelId: channel.id, messageId: msg.id, question: question, options: arr, date})
            client.votes.set(id, []);

            msg.edit({
                embeds: [
                    generateEmbed({
                        title: question,
                        description: `Ends ${time(date, TimestampStyles.RelativeTime)}\n\n` + arr.map(r => {
                            return `**${r}** - 0 (0%)`
                        }).join("\n")
                    })
                ],
                components: [new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId("votePoll_" + id)
                        .setOptions(arr.map((r, i) => {
                            return {
                                label: r,
                                value: "" + i
                            }
                        }))
                )]
            })
        })
}

function pollTask(client) {
    let currentDate = new Date();

    client.polls.filter(
        r => currentDate >= r.date
    ).forEach((poll, id) => {
        client.channels.fetch(poll.channelId).then(channel => {
            channel.messages.fetch(poll.messageId).then(async msg => {
                
                let votes = client.votes.get(id);
                let frequency = {};

                for (let vote of votes) {
                    if (frequency[vote.vote] == null) {
                        frequency[vote.vote] = 1;
                        continue;
                    }

                    frequency[vote.vote]++;
                }

                let winningOption = Object.keys(frequency).reduce((b, a) => (frequency[a] > frequency[b] ? a : b));

                await msg.edit({
                    embeds: [generateEmbed({
                        title: poll.question,
                        description: `Ends ${time(poll.date, TimestampStyles.RelativeTime)}\n\n` + poll.options.map((r, i) => {
                                return `**${r}** - ${votes.filter(a => a.vote == i).length} (${Math.round((votes.filter(a => a.vote == i).length / votes.length) * 100)}%)`
                            }).join("\n")
                    }), generateEmbed({
                        title: "Winning Vote",
                        description: poll.options[winningOption]
                    })],
                    components: []
                })

                client.polls.delete(id);
                client.votes.delete(id);

                deletePoll(id);
                deleteVote(id);
            }).catch(err => {
                console.log("Failed to fetch message for poll ID " + id);
                console.log(err);
            })
        }).catch(err => {
            console.log("Failed to fetch channel for poll ID " + id)
            console.log(err);
        })
    })
}

async function handleVote(client, interaction) {

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
    await insertVote(id, vote, interaction.user.id);
}

module.exports = {
    handlePollCreation, pollTask, handleVote
}