const { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputStyle, TextInputBuilder, ModalBuilder, SlashCommandBuilder, resolveColor, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction } = require("discord.js");
const { generateEmbed } = require("./util");
const customCommands = require(process.cwd() + "/config/custom_commands.json");
const { writeFile } = require("fs/promises")

function createCustomCommand(interaction) {
    interaction.reply({
        embeds: [],
        components: [new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Set Text Content")
                .setCustomId("setTextContent")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setLabel("Add Embed")
                .setCustomId("addEmbed")
                .setStyle(ButtonStyle.Secondary)
        ), new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Finish")
                .setCustomId('finishCommand')
                .setStyle(ButtonStyle.Danger)
        )]
    });
}

async function setTextContent(interaction) {
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
}

async function addEmbed(interaction) {
    await interaction.showModal(new ModalBuilder().setTitle("New Embed").addComponents(
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("title").setStyle(TextInputStyle.Short).setLabel("Title").setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("description").setStyle(TextInputStyle.Paragraph).setLabel("Description").setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("color").setStyle(TextInputStyle.Short).setLabel("Color").setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("footer").setStyle(TextInputStyle.Short).setLabel("Footer").setRequired(false)
        )
    ).setCustomId("content"));

    let res = await interaction.awaitModalSubmit({
        time: 60 * 1000 * 30
    });

    res.deferUpdate();

    let fields = res.fields.fields.filter(r => r.value != '');

    if (fields.size == 0) {
        return;
    }

    let embed = {};

    for (let [key, value] of fields) {
        embed[key] = value.value;
    }

    if (embed["color"] != undefined) embed["color"] = resolveColor(embed["color"]);

    interaction.message.edit({
        embeds: interaction.message.embeds.concat(new EmbedBuilder(embed))
    });
}

async function finishCreation(client, interaction) {
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

    let slashCommand = new SlashCommandBuilder()
        .setName(command.name)
        .setDescription(command.description)
        .toJSON();

    interaction.message.delete();
    r.reply({
        flags: ["Ephemeral"],
        embeds: [generateEmbed({
            title: "Command created"
        })]
    });


    client.commands.set(command.name, {
        isCustom: true,
        info: slashCommand,
        run: (client, interaction) => interaction.reply(command.response)
    })

    await interaction.guild.commands.create(slashCommand);

    customCommands.push(command);
    await writeFile(process.cwd() + "/config/custom_commands.json", JSON.stringify(customCommands, 2, 2));
}

function listCustomCommands(interaction) {
    interaction.reply({
        flags: ["Ephemeral"],
        embeds: [generateEmbed({
            title: "List of commands",
            description: customCommands.map((r, i) => {
                `${i + 1}. ${r.name} - ${r.description}`
            }).join("\n")
        })],
        components: [new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("deleteCommand")
                .setPlaceholder("Delete")
                .addOptions(customCommands.map(r => {
                    return {
                        label: r.name,
                        value: r.name
                    }
                }))
        )]
    })
}

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 */
async function deleteCustomCommand(client, interaction) {
    try {
        let toDelete = interaction.values[0];
        let cmds = customCommands.filter(r => !r.name == toDelete);

        await interaction.reply({
            flags: ["Ephemeral"],
            embeds: [generateEmbed({
                title: "Command Deleted"
            })]
        })

        client.commands.delete(toDelete);

        await interaction.guild.commands.delete(interaction.guild.commands.cache.find(r => r.name == toDelete))
        await writeFile(process.cwd() + "/config/custom_commands.json", JSON.stringify(cmds, 2, 2));
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createCustomCommand, setTextContent, finishCreation, addEmbed, listCustomCommands, deleteCustomCommand
}