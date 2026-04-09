// ============================================
// index.js - Entry Point
// Starts the WhatsApp bot and connects all modules
// ============================================

require('dotenv').config(); // Load environment variables from .env file

const { createClient, onQR, onReady, startClient } = require('./modules/client'); // Import client functions from client.js
const { detectOffice } = require('./modules/detector'); // Import office detector from detector.js
const { analyzeWithAI } = require('./modules/imageAnalyzer'); // Import AI analyzer from imageAnalyzer.js
const { markAsReported, scheduleReset } = require('./modules/tracker'); // Import tracker functions from tracker.js
const { scheduleReport } = require('./modules/reporter'); // Import report scheduler from reporter.js
const { GROUP_NAME } = require('./config'); // Import group name from config.js

const client = createClient(); // Create WhatsApp client (from client.js)

onQR(client); // Register QR code handler (from client.js)
onReady(client); // Register ready event handler (from client.js)

// Purpose: Logs all incoming messages with chat name for monitoring
client.on('message_create', (message) => { // Listen for ALL messages
    message.getChat().then(chat => {
        if (chat.isGroup) { // Only log group messages
            console.log(`📨 Chat name: "${chat.name}"`); // Log group chat name
        }
    });
});

// Purpose: Listens for incoming messages and processes them
client.on('message_create', async (message) => { // Listen for every incoming message
    try {
        const chat = await message.getChat(); // Get chat info for the message

        if (!chat.isGroup) return; // Ignore messages not from a group
        if (chat.name !== GROUP_NAME) return; // Ignore messages from other groups
        if (message.fromMe) return; // Ignore messages sent by the bot itself

        console.log(`📨 Message from: ${chat.name}`); // Log message source

        const officeText = message.body || ''; // Get message text, default to empty string
        let imageBuffer = null; // Initialize image buffer as null
        let mimeType = 'image/jpeg'; // Default image type

        if (message.hasMedia) { // Check if message has an image attached
            const media = await message.downloadMedia(); // Download the image

            if (media && media.mimetype.startsWith('image/')) { // Check if downloaded file is an image
                imageBuffer = Buffer.from(media.data, 'base64'); // Convert base64 to buffer
                mimeType = media.mimetype; // Get actual image type
            }
        }

        // Send both text and image to Gemini AI for office detection
        const aiResult = await analyzeWithAI(officeText, imageBuffer, mimeType); // Analyze with AI (from imageAnalyzer.js)
        console.log(`🤖 AI detected: ${aiResult}`); // Log AI detection result

        if (Array.isArray(aiResult)) { // Check if result is array (bulk "সকল" report)
            aiResult.forEach(o => markAsReported(o)); // Mark each sub-office as reported (from tracker.js)
            console.log(`📌 Bulk report - offices marked: ${aiResult.join(', ')}`); // Log bulk report
        } else if (aiResult) { // Check if single office was detected
            markAsReported(aiResult); // Mark office as reported (from tracker.js)
            console.log(`📌 Office reported: ${aiResult}`); // Log the detected office
        } else {
            console.log(`⚠️ Could not detect office from message`); // Log if no office detected
        }

    } catch (error) {
        console.error('❌ Error processing message:', error.message); // Log any processing errors
    }
});

scheduleReset(); // Schedule midnight tracker reset (from tracker.js)
scheduleReport(client); // Schedule 5PM daily report (from reporter.js)

startClient(client); // Start WhatsApp connection (from client.js)

console.log('🚀 WhatsApp bot starting...'); // Log bot startup