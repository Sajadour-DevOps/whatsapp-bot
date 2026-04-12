// ============================================
// index.js - Entry Point
// Starts the WhatsApp bot and connects all modules
// Handles multiple groups and message types
// ============================================

require('dotenv').config(); // Load environment variables from .env file

const { createClient, onQR, onReady, startClient } = require('./modules/client'); // Import client functions from client.js
const { detectMessageTypes, askAdminForDecision, checkAdminReply, detectOfficeFromText, detectBulkReport } = require('./modules/detector'); // Import detector functions from detector.js
const { analyzeWithAI } = require('./modules/imageAnalyzer'); // Import AI analyzer from imageAnalyzer.js
const { markAsReported, scheduleReset } = require('./modules/tracker'); // Import tracker functions from tracker.js
const { scheduleAll } = require('./modules/reporter'); // Import scheduler from reporter.js
const { MESSAGE_TYPES, ADMIN_NUMBER } = require('./config'); // Import settings from config.js

const client = createClient(); // Create WhatsApp client (from client.js)

onQR(client); // Register QR code handler (from client.js)
onReady(client); // Register ready event handler (from client.js)

// Purpose: Logs all incoming group messages for monitoring
client.on('message_create', (message) => { // Listen for ALL messages
    message.getChat().then(chat => {
        if (chat.isGroup) { // Only log group messages
            console.log(`📨 Chat name: "${chat.name}"`); // Log group chat name
        }
    });
});

// Purpose: Processes incoming messages from monitored groups
client.on('message_create', async (message) => { // Listen for every incoming message
    try {
        const chat = await message.getChat(); // Get chat info for the message

        // --- Check if admin replied to a conflict ---
        if (message.from === ADMIN_NUMBER) { // Check if message is from admin (from config.js)
            const adminReply = checkAdminReply(message); // Check admin reply (from detector.js)
            if (adminReply) { // If admin resolved a conflict
                await processMessage(adminReply.originalMessage, adminReply.resolvedType); // Process with resolved type (from index.js)
                return; // Exit after processing
            }
        }

        if (!chat.isGroup) return; // Ignore non-group messages

        // --- Find matching message type config for this group ---
        const msgTypeConfig = MESSAGE_TYPES.find(t => t.sourceGroup === chat.name); // Find config for this group (from config.js)
        if (!msgTypeConfig) return; // Ignore if group not in config

        if (message.fromMe) return; // Ignore messages sent by the bot itself

        console.log(`📨 Message from: ${chat.name}`); // Log message source

        // --- Detect message type by keywords ---
        const matchedTypes = detectMessageTypes(message.body || ''); // Detect message types (from detector.js)

        if (matchedTypes.length === 0) { // No keyword matched
            console.log(`⚠️ No message type detected`); // Log no type detected
            return; // Exit
        }

        if (matchedTypes.length > 1) { // Multiple types matched = conflict
            console.log(`⚠️ Conflict detected: ${matchedTypes.map(t => t.type).join(', ')}`); // Log conflict
            await askAdminForDecision(client, message.id, matchedTypes, message); // Ask admin (from detector.js)
            return; // Exit until admin decides
        }

        // --- Single type matched, process directly ---
        await processMessage(message, matchedTypes[0]); // Process message (from index.js)

    } catch (error) {
        console.error('❌ Error processing message:', error.message); // Log any errors
    }
});

// Purpose: Processes a message with a resolved message type
// Parameters: message - WhatsApp message object, msgType - resolved message type config
async function processMessage(message, msgType) {
    const officeText = message.body || ''; // Get message text
    let imageBuffer = null; // Initialize image buffer
    let mimeType = 'image/jpeg'; // Default image type

    if (message.hasMedia) { // Check if message has media
        const media = await message.downloadMedia(); // Download media
        if (media && media.mimetype.startsWith('image/')) { // Check if image
            imageBuffer = Buffer.from(media.data, 'base64'); // Convert to buffer
            mimeType = media.mimetype; // Get actual mime type
        }
    }

    // Send to Gemini AI for office detection
    const aiResult = await analyzeWithAI(officeText, imageBuffer, mimeType, msgType.trackLevel); // Analyze with AI (from imageAnalyzer.js)
    console.log(`🤖 AI detected: ${aiResult}`); // Log AI result

    // Check for bulk "সকল" report
    const bulkResult = detectBulkReport(officeText, msgType.trackLevel); // Check bulk report (from detector.js)

    if (bulkResult) { // Bulk report detected
        bulkResult.forEach(office => markAsReported(msgType.type, office)); // Mark all offices (from tracker.js)
        console.log(`📌 Bulk report: ${bulkResult.join(', ')}`); // Log bulk report
    } else if (aiResult) { // Single office detected
        markAsReported(msgType.type, aiResult); // Mark office as reported (from tracker.js)
        console.log(`📌 Office reported: ${aiResult}`); // Log office
    } else {
        console.log(`⚠️ Could not detect office from message`); // Log if not detected
    }
}

scheduleReset(); // Schedule midnight tracker reset (from tracker.js)
scheduleAll(client); // Schedule all reports and reminders (from reporter.js)

startClient(client); // Start WhatsApp connection (from client.js)

console.log('🚀 WhatsApp bot starting...'); // Log bot startup