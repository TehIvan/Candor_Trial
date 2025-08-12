const { EmbedBuilder, time, TimestampStyles } = require("@discordjs/builders");
const { embedSettings } = require(process.cwd() + "/config/config.json");
const chrono = require('chrono-node');
const { Duration } = require('@sapphire/duration');
const { deletePoll, deleteVote } = require("./sql");
const { resolveColor } = require("discord.js");

function generateEmbed(options) {
    return new EmbedBuilder(options).setFooter(embedSettings.footer).setColor(resolveColor(embedSettings.color));
}

function parseTimeString(input) {
    const date = chrono.parseDate(input);
    if (date) return date;

    const duration = new Duration(input).fromNow;
    if (duration) return duration;

    return null;
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
                    })]
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


module.exports = {
    generateEmbed, parseTimeString,
    reminderTask, pollTask
}