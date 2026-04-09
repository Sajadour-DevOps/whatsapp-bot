// ============================================
// modules/reporter.js - Report Sender Module
// Sends missing office report to recipients at 5PM
// Also sends report to the group if enabled
// Uses node-cron for scheduling
// ============================================

const cron = require('node-cron'); // Import cron scheduler for timed tasks
const { RECIPIENTS, REPORT_TIME, GROUP_NAME, REPORT_GROUP_NAME, SEND_REPORT_TO_GROUP } = require('../config'); // Import settings from config.js
const { getMissingOffices, getReportedOffices } = require('./tracker'); // Import tracker functions from tracker.js

// Purpose: Builds the report message text
// Returns: formatted string with missing and reported offices
function buildReportMessage() {
    const missing = getMissingOffices(); // Get missing offices list (from tracker.js)
    const reported = getReportedOffices(); // Get reported offices list (from tracker.js)

    const date = new Date().toLocaleDateString('bn-BD'); // Get today's date in Bengali format

    let message = `📋 *দৈনিক রিপোর্ট - ${date}*\n\n`; // Start message with date header

    if (missing.length === 0) { // Check if all offices have reported
        message += `✅ আজকে সকল অফিস রিপোর্ট দিয়েছে।\n`; // All offices reported message
    } else {
        message += `❌ *রিপোর্ট দেয়নি (${missing.length}টি অফিস):*\n`; // Missing offices header
        missing.forEach(office => { // Loop through each missing office
            message += `• ${office}\n`; // Add each missing office to message
        });
    }

    message += `\n✅ *রিপোর্ট দিয়েছে (${reported.length}টি অফিস):*\n`; // Reported offices header
    reported.forEach(office => { // Loop through each reported office
        message += `• ${office}\n`; // Add each reported office to message
    });

    return message; // Return the complete report message
}

// Purpose: Sends the report message to all recipients privately and optionally to group
// Parameters: client - the WhatsApp client object from client.js
async function sendReport(client) {
    const message = buildReportMessage(); // Build the report message (from reporter.js)

    // Send to private recipients from config.js
    for (const recipient of RECIPIENTS) { // Loop through each recipient
        try {
            await client.sendMessage(recipient, message); // Send message privately
            console.log(`✅ Report sent to: ${recipient}`); // Log successful send
        } catch (error) {
            console.error(`❌ Failed to send to ${recipient}:`, error.message); // Log error
        }
    }

    // Send to group if enabled in config.js
    if (SEND_REPORT_TO_GROUP) { // Check if group report is enabled
        try {
            const chats = await client.getChats(); // Get all chats from WhatsApp
            const group = chats.find(chat => chat.name === REPORT_GROUP_NAME); // Find report target group by name

            if (group) { // Check if group was found
                await group.sendMessage(message); // Send report to group
                console.log(`✅ Report sent to group: ${GROUP_NAME}`); // Log success
            } else {
                console.error(`❌ Group not found: ${GROUP_NAME}`); // Log if group not found
            }
        } catch (error) {
            console.error(`❌ Failed to send to group:`, error.message); // Log error
        }
    }
}

// Purpose: Schedules the report to be sent every day at 5PM
// Parameters: client - the WhatsApp client object from client.js
function scheduleReport(client) {
    cron.schedule(REPORT_TIME, () => { // Schedule using cron expression from config.js
        console.log('⏰ Sending daily report...'); // Log that report is being sent
        sendReport(client); // Send the report (from reporter.js)
    }, {
        timezone: 'Asia/Dhaka' // Set timezone to Bangladesh
    });

    console.log('📅 Daily report scheduled at 5PM (Asia/Dhaka)'); // Log schedule confirmation
}

// Export functions for use in other modules
module.exports = {
    scheduleReport,     // Exported: schedules daily 5PM report
    sendReport,         // Exported: sends report immediately
    buildReportMessage, // Exported: builds report message text
};