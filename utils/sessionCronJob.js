// utils/deleteExpiredSessions.js
const Session = require('../models/sessionModel');

async function deleteExpiredSessions() {
    const now = new Date();
    try {
        const result = await Session.deleteMany({ expires: { $lt: now } });
        console.log(`${result.deletedCount} expired session(s) have been deleted.`);
    } catch (error) {
        console.error('Error deleting expired sessions', error);
    }
}

module.exports = deleteExpiredSessions;