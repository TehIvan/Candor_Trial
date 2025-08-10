const { Client } = require("discord.js");
const { readdir } = require("fs/promises");

const commandsPath = process.cwd() + '/src/commands';
const eventsPath = process.cwd() + '/src/events';

/**
 * 
 * @param {Client} client 
 */
async function loadCommands(client) {
    console.log("Loading commands");

    try {
        const files = await readdir(commandsPath);

        for (let file of files) {
            let path = commandsPath + "/" + file;
            let commandFile = require(path);
            client.commands.set(commandFile.info.name, commandFile);
            console.log("Loaded command " + commandFile.info.name);
        }
    } catch (error) {
        console.log("Error loading commands");
        console.log(error);
    }
}

/**
 * Loads events
 * @param {Client} client 
 */
async function loadEvents(client) {
    console.log("Loading events!");

    try {
        const files = await readdir(eventsPath);

        for (let file of files) {
            let path = eventsPath + "/" + file;
            let eventFile = require(path);

            client.on(eventFile.name, eventFile.run.bind(null, client));
        }
    } catch (error) {
        console.log("Error loading events");
        console.log(error);
    }
}


module.exports = {
    loadCommands,
    loadEvents
}