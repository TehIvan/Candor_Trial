const mysql = require("mysql2/promise");

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

async function createTables() {
    try {
        await connection.query(
            "CREATE TABLE IF NOT EXISTS reminders (id INT PRIMARY KEY AUTO_INCREMENT, userId TEXT, message TEXT, date DATETIME)"
        );

        await connection.query(
            "CREATE TABLE IF NOT EXISTS polls (id INT PRIMARY KEY AUTO_INCREMENT, channelId TEXT, messageId TEXT, question TEXT, options TEXT, date DATETIME)"
        );

        await connection.query(
            "CREATE TABLE IF NOT EXISTS votes (pollId INT, userId TEXT, vote INT)"
        );
    } catch (error) {
        throw error;
    }
}

function insertReminder(userId, message, date) {
    return new Promise((resolve, reject) => {
        connection.query("INSERT INTO reminders (userId, message, date) VALUES (?, ?, ?)", [userId, message, date])
        .then(([rows, fields]) => {
            resolve(rows.insertId);
        })
        .catch(err => {
            reject(err);
        })
    })
}

function deleteReminder(id) {
    return new Promise((resolve, reject) => {
        connection.query("DELETE FROM reminders WHERE id = ?", id)
        .then(() => {
            resolve();
        })
        .catch(err => {
            reject(err);
        })
    })
}

function getReminders() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM reminders")
        .then(([rows, fields]) => {
            resolve(rows);
        }).catch(err => {
            reject(err);
        })
    })
}

function getRemindersFromUser(userId) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM reminders WHERE userId = ?", userId)
        .then(([rows, fields]) => {
            resolve(rows);
        }).catch(err => {
            reject(err);
        })
    })
}

function insertPoll(channel, msg, question, options, date) {
    return new Promise((resolve, reject) => {
        connection.query("INSERT INTO polls (channelId, messageId, question, options, date) VALUES (?, ?, ?, ?, ?)", [channel.id, msg.id, question, options, date])
        .then(([rows, fields]) => {
            resolve(rows.insertId);
        })
        .catch(err => {
            reject(err);
        })
    })
}

function getPolls() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM polls")
        .then(([rows, fields]) => {
            resolve(rows);
        }).catch(err => {
            reject(err);
        })
    })
}

function deletePoll(id) {
    return new Promise((resolve, reject) => {
        connection.query("DELETE FROM polls WHERE id = ?", id)
        .then(() => {
            resolve();
        })
        .catch(err => {
            reject(err);
        })
    })
}

function deleteVote(id) {
    return new Promise((resolve, reject) => {
        connection.query("DELETE FROM votes WHERE pollId = ?", id)
        .then(() => {
            resolve();
        })
        .catch(err => {
            reject(err);
        })
    })
}

function insertVote(id, vote, userId) {
    return new Promise((resolve, reject) => {
        connection.query("INSERT INTO votes (pollId, userId, vote) VALUES (?, ?, ?)", [id, userId, vote])
        .then(() => {
            resolve()
        })
        .catch(err => {
            reject(err);
        })
    })
}

function getVotes() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM votes")
        .then(([rows, fields]) => {
            resolve(rows);
        }).catch(err => {
            reject(err);
        })
    })
}

module.exports = {
    createTables, insertReminder, deleteReminder, getReminders, getRemindersFromUser,
    getPolls, insertPoll, deletePoll,
    getVotes, insertVote, deleteVote
}