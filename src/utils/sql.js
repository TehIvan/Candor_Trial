const mysql = require("mysql2/promise");
const { database_details } = require(process.cwd() + "/config/config.json");

const connection = mysql.createPool(database_details);

function createTables() {
    connection.query(
        "CREATE TABLE IF NOT EXISTS reminders (id INT PRIMARY KEY AUTO_INCREMENT, user_id TEXT, message TEXT, date DATETIME)"
    ).catch((err) => {
        throw err;
    });
}

function insertReminder(userId, message, date) {
    return new Promise((resolve, reject) => {
        connection.query("INSERT INTO reminders (user_id, message, date) VALUES (?, ?, ?)", [userId, message, date])
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
        connection.query("SELECT * FROM reminders WHERE user_id = ?", userId)
        .then(([rows, fields]) => {
            resolve(rows);
        }).catch(err => {
            reject(err);
        })
    })
}

module.exports = {
    createTables, insertReminder, deleteReminder, getReminders, getRemindersFromUser
}