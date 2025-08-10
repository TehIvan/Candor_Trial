const { EmbedBuilder } = require("@discordjs/builders");
const { embedSettings } = require(process.cwd() + "/config/config.json");
const chrono = require('chrono-node');
const { Duration } = require('@sapphire/duration');

function generateEmbed(options) {
    return new EmbedBuilder({... embedSettings, ... options})
}

function parseTimeString(input) {
    const date = chrono.parseDate(input);
    if (date) return date;
    
    const duration = new Duration(input).fromNow;
    if (duration) return duration;
    
    return null;
}


module.exports = {
    generateEmbed, parseTimeString
}