const { EmbedBuilder } = require("@discordjs/builders");
const { embedSettings } = require(process.cwd() + "/config/config.json");
const chrono = require('chrono-node');
const { Duration } = require('@sapphire/duration');
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

function mapToJson(map) {
    const obj = {};
    for (const [key, value] of map) {
        obj[key] = value instanceof Map ? mapToJson(value) : value;
    }
    return obj;
}

module.exports = {
    generateEmbed, parseTimeString, mapToJson
}