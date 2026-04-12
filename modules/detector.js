// ============================================
// modules/detector.js - Message Type & Office Detector Module
// Detects message type using keywords from config.js
// Detects which office sent the message
// Handles conflict resolution via admin
// ============================================

const { MESSAGE_TYPES, OFFICES, ALL_MAIN_OFFICES, ALL_SUB_OFFICES, ADMIN_NUMBER } = require('../config'); // Import settings from config.js

// --- In-memory store for pending admin decisions ---
const pendingDecisions = {}; // Stores messages waiting for admin decision

// Purpose: Detects message type based on keywords
// Parameters: text - message text to search through
// Returns: array of matching MESSAGE_TYPES objects, or empty array
function detectMessageTypes(text) {
    if (!text) return []; // Return empty if no text

    return MESSAGE_TYPES.filter(msgType => // Filter message types by keyword match
        msgType.keywords.some(keyword => text.includes(keyword)) // Check if any keyword matches
    );
}

// Purpose: Sends conflict message to admin for decision
// Parameters: client - WhatsApp client, messageId - unique message id, matchedTypes - conflicting types, originalMessage - the message object
async function askAdminForDecision(client, messageId, matchedTypes, originalMessage) {
    const options = matchedTypes // Build options list for admin
        .map((t, i) => `${i + 1}️⃣ ${t.type}`) // Format each type with number
        .join('\n'); // Join with newline

    const adminMessage = `⚠️ *Message Type Conflict Detected*\n\nনিচের message-এর type কোনটা?\n\n${options}\n\nশুধু নম্বর লিখুন (1, 2...)`; // Build admin message

    await client.sendMessage(ADMIN_NUMBER, adminMessage); // Send conflict message to admin (from config.js)

    pendingDecisions[ADMIN_NUMBER] = { // Store pending decision
        messageId,       // Store message id
        matchedTypes,    // Store conflicting types
        originalMessage, // Store original message for later processing
    };

    console.log(`⚠️ Conflict sent to admin for decision`); // Log conflict
}

// Purpose: Checks if admin replied to a pending decision
// Parameters: message - incoming message object
// Returns: pending decision object or null
function checkAdminReply(message) {
    if (message.from !== ADMIN_NUMBER) return null; // Ignore if not from admin (from config.js)
    if (!pendingDecisions[ADMIN_NUMBER]) return null; // Ignore if no pending decision

    const reply = message.body.trim(); // Get admin reply
    const decision = pendingDecisions[ADMIN_NUMBER]; // Get pending decision
    const index = parseInt(reply) - 1; // Convert reply to array index

    if (isNaN(index) || index < 0 || index >= decision.matchedTypes.length) return null; // Ignore invalid reply

    const resolvedType = decision.matchedTypes[index]; // Get resolved message type
    delete pendingDecisions[ADMIN_NUMBER]; // Clear pending decision

    console.log(`✅ Admin resolved conflict: ${resolvedType.type}`); // Log resolution

    return { resolvedType, originalMessage: decision.originalMessage }; // Return resolved type and original message
}

// Purpose: Detects office name from text based on trackLevel
// Parameters: text - message text, trackLevel - "subOffice" or "mainOffice"
// Returns: matched office name or null
function detectOfficeFromText(text, trackLevel) {
    if (!text) return null; // Return null if no text

    const officeList = trackLevel === 'subOffice' ? ALL_SUB_OFFICES : ALL_MAIN_OFFICES; // Choose list based on trackLevel (from config.js)

    for (const office of officeList) { // Loop through each office
        const keyword = office // Extract keyword from office name
            .replace('অভিযোগ কেন্দ্র', '') // Remove suffix
            .replace('জোনাল অফিস', '')      // Remove suffix
            .replace('এরিয়া অফিস', '')      // Remove suffix
            .replace('সাব-জোনাল অফিস', '')  // Remove suffix
            .trim();                          // Remove extra spaces

        if (text.includes(keyword)) return office; // Return office if keyword found
    }

    return null; // Return null if no match
}

// Purpose: Detects "সকল" bulk report pattern
// Parameters: text - message text, trackLevel - "subOffice" or "mainOffice"
// Returns: array of office names under that zone, or null
function detectBulkReport(text, trackLevel) {
    if (!text) return null; // Return null if no text
    if (!text.includes('সকল')) return null; // Return null if "সকল" not found

    for (const [mainOffice, data] of Object.entries(OFFICES)) { // Loop through each main office (from config.js)
        const keyword = mainOffice // Extract keyword from main office name
            .replace('জোনাল অফিস', '')     // Remove suffix
            .replace('সাব-জোনাল অফিস', '') // Remove suffix
            .trim();                         // Remove extra spaces

        if (text.includes(keyword)) { // Check if message contains main office keyword
            if (trackLevel === 'subOffice') { // Return sub-offices if trackLevel is subOffice
                return data.subOffices.map(s => s.name); // Return all sub-office names
            } else {
                return [mainOffice]; // Return main office name
            }
        }
    }

    return null; // Return null if no match
}

// Export all functions for use in other modules
module.exports = {
    detectMessageTypes,  // Exported: detects message type by keyword
    askAdminForDecision, // Exported: sends conflict to admin
    checkAdminReply,     // Exported: checks admin reply for conflict resolution
    detectOfficeFromText, // Exported: detects office from text
    detectBulkReport,    // Exported: detects bulk "সকল" report
};