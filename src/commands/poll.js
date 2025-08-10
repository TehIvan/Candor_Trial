const { SlashCommandBuilder, ChatInputCommandInteraction, Client, ActionRow, ActionRowBuilder, StringSelectMenuBuilder, time, TimestampStyles } = require("discord.js");
const { parseTimeString, generateEmbed } = require("../utils/util");
const { insertPoll } = require("../utils/sql");
const { pollsChannelId } = require(process.cwd() + '/config/config.json')

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
}