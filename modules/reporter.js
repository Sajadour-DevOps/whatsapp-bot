// ============================================
// modules/reporter.js - Report Sender Module
// Sends missing office report to recipients at scheduled time
// Sends reminders to main office contacts 1 hour before report time
// Uses node-cron for scheduling
// ============================================

const cron = require('node-cron'); // Import cron scheduler for timed tasks
const { MESSAGE_TYPES, OFFICES } = require('../config'); // Import settings from config.js
const { getMissingOffices, getReportedOffices, getMainOfficeContacts, getMainOfficeForSubOffice } = require('./tracker'); // Import tracker functions from tracker.js

// Purpose: Builds the report message text for a specific message type
// Parameters: msgType - message type object from config.js
// Returns: formatted string with missing and reported offices
function buildReportMessage(msgType) {
    const missing = getMissingOffices(msgType.type, msgType.trackLevel); // Get missing offices (from tracker.js)
    const reported = getReportedOffices(msgType.type); // Get reported offices (from tracker.js)

    const date = new Date().toLocaleDateString('bn-BD'); // Get today's date in Bengali format

    let message = `📋 *দৈনিক রিপোর্ট - ${date}*\n`; // Start message with date header
    message += `*${msgType.type}*\n\n`; // Add message type

    if (missing.length === 0) { // Check if all offices have reported
        message += `✅ আজকে সকল অফিস রিপোর্ট দিয়েছে।\n`; // All reported message
    } else {
        message += `❌ *রিপোর্ট দেয়নি (${missing.length}টি):*\n`; // Missing header
        missing.forEach(office => { // Loop through missing offices
            message += `• ${office}\n`; // Add each missing office
        });
    }

    message += `\n✅ *রিপোর্ট দিয়েছে (${reported.length}টি):*\n`; // Reported header
    reported.forEach(office => { // Loop through reported offices
        message += `• ${office}\n`; // Add each reported office
    });

    return message; // Return complete report message
}

// Purpose: Sends report to all destination groups and numbers for a message type
// Parameters: client - WhatsApp client, msgType - message type object from config.js
async function sendReport(client, msgType) {
    const message = buildReportMessage(msgType); // Build report message (from reporter.js)

    // Send to destination groups
    for (const groupName of msgType.destinationGroups) { // Loop through destination groups (from config.js)
        try {
            const chats = await client.getChats(); // Get all chats
            const group = chats.find(chat => chat.name === groupName); // Find group by name
            if (group) { // Check if group found
                await group.sendMessage(message); // Send report to group
                console.log(`✅ Report sent to group: ${groupName}`); // Log success
            } else {
                console.error(`❌ Group not found: ${groupName}`); // Log if not found
            }
        } catch (error) {
            console.error(`❌ Failed to send to group ${groupName}:`, error.message); // Log error
        }
    }

    // Send to destination numbers privately
    for (const number of msgType.destinationNumbers) { // Loop through destination numbers (from config.js)
        try {
            await client.sendMessage(number, message); // Send report privately
            console.log(`✅ Report sent to: ${number}`); // Log success
        } catch (error) {
            console.error(`❌ Failed to send to ${number}:`, error.message); // Log error
        }
    }
}

// Purpose: Sends reminder to main office contacts and source group for unreported offices
// Parameters: client - WhatsApp client, msgType - message type object from config.js
async function sendReminder(client, msgType) {
    const missing = getMissingOffices(msgType.type, msgType.trackLevel); // Get missing offices (from tracker.js)

    if (missing.length === 0) { // Check if all offices have reported
        console.log(`✅ [${msgType.type}] All offices reported, no reminder needed`); // Log no reminder needed
        return; // Exit if no missing offices
    }

    // Group missing sub-offices by their main office
    const mainOfficesToRemind = new Set(); // Set to avoid duplicate main offices

    for (const office of missing) { // Loop through missing offices
        if (msgType.trackLevel === 'subOffice') { // Check track level
            const mainOffice = getMainOfficeForSubOffice(office); // Get main office for sub-office (from tracker.js)
            if (mainOffice) mainOfficesToRemind.add(mainOffice); // Add main office to remind set
        } else {
            mainOfficesToRemind.add(office); // Add main office directly
        }
    }

    const reminderMessage = `⏰ *রিপোর্ট তাগাদা*\n\nনিচের অফিসের রিপোর্ট এখনো পাওয়া যায়নি:\n${missing.map(o => `• ${o}`).join('\n')}\n\nঅনুগ্রহ করে দ্রুত পাঠান।`; // Build reminder message

    // Send reminder to main office contacts privately
    for (const mainOffice of mainOfficesToRemind) { // Loop through main offices to remind
        const contacts = getMainOfficeContacts(mainOffice); // Get contacts (from tracker.js)
        console.log(`🔍 ${mainOffice} contacts: ${JSON.stringify(contacts)}`); // Debug: log contacts
        for (const contact of contacts) { // Loop through each contact
            try {
                await client.sendMessage(contact, reminderMessage); // Send reminder privately
                console.log(`⏰ Reminder sent to: ${contact} (${mainOffice})`); // Log success
            } catch (error) {
                console.error(`❌ Failed to send reminder to ${contact}:`, error.message); // Log error
            }
        }
    }

    // Send reminder to source group
    try {
        const chats = await client.getChats(); // Get all chats
        const group = chats.find(chat => chat.name === msgType.sourceGroup); // Find source group (from config.js)
        if (group) { // Check if group found
            await group.sendMessage(reminderMessage); // Send reminder to group
            console.log(`⏰ Reminder sent to group: ${msgType.sourceGroup}`); // Log success
        }
    } catch (error) {
        console.error(`❌ Failed to send reminder to group:`, error.message); // Log error
    }
}

// Purpose: Schedules report and reminder for all message types
// Parameters: client - WhatsApp client object from client.js
function scheduleAll(client) {
    MESSAGE_TYPES.forEach(msgType => { // Loop through each message type (from config.js)

        // // Test: fire immediately once
        // console.log(`🔔 Test firing for: ${msgType.type}`); // Log test fire
        // sendReminder(client, msgType); // Test reminder immediately (from reporter.js)

        // Schedule report
        cron.schedule(msgType.reportTime, () => { // Schedule using cron expression
            console.log(`⏰ Sending report for: ${msgType.type}`); // Log report sending
            sendReport(client, msgType); // Send report (from reporter.js)
        }, {
            timezone: 'Asia/Dhaka' // Set timezone to Bangladesh
        });

        // Schedule reminder
        cron.schedule(msgType.reminderTime, () => { // Schedule reminder using cron expression
            console.log(`⏰ Sending reminder for: ${msgType.type}`); // Log reminder sending
            sendReminder(client, msgType); // Send reminder (from reporter.js)
        }, {
            timezone: 'Asia/Dhaka' // Set timezone to Bangladesh
        });

        console.log(`📅 Scheduled report [${msgType.type}]: ${msgType.reportTime}`); // Log schedule
        console.log(`📅 Scheduled reminder [${msgType.type}]: ${msgType.reminderTime}`); // Log reminder schedule
    });
}

// Export functions for use in other modules
module.exports = {
    scheduleAll,        // Exported: schedules all reports and reminders
    sendReport,         // Exported: sends report immediately
    sendReminder,       // Exported: sends reminder immediately
    buildReportMessage, // Exported: builds report message text
};