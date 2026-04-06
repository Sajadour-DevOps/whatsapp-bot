// ============================================
// index.js - Entry Point
// Starts the WhatsApp bot and connects all modules
// ============================================

const { createClient, onQR, onReady, startClient } = require('./modules/client'); // Import client functions from client.js
const { detectOffice } = require('./modules/detector'); // Import office detector from detector.js
const { analyzeImage } = require('./modules/imageAnalyzer'); // Import image analyzer from imageAnalyzer.js
const { markAsReported, scheduleReset } = require('./modules/tracker'); // Import tracker functions from tracker.js
const { scheduleReport } = require('./modules/reporter'); // Import report scheduler from reporter.js
const { GROUP_NAME } = require('./config'); // Import group name from config.js

const client = createClient(); // Create WhatsApp client (from client.js)

onQR(client); // Register QR code handler (from client.js)
onReady(client); // Register ready event handler (from client.js)

// Purpose: Listens for incoming messages and processes them
client.on('message', async (message) => { // Listen for every incoming message
    try {
        const chat = await message.getChat(); // Get chat info for the message

        if (!chat.isGroup) return; // Ignore messages not from a group
        if (chat.name !== GROUP_NAME) return; // Ignore messages from other groups

        let officeText = message.body || ''; // Get message text, default to empty string
        let aiResult = null; // Initialize AI result as null

        if (message.hasMedia) { // Check if message has an image attached
            const media = await message.downloadMedia(); // Download the image

            if (media && media.mimetype.startsWith('image/')) { // Check if downloaded file is an image
                const imageBuffer = Buffer.from(media.data, 'base64'); // Convert base64 to buffer
                aiResult = await analyzeImage(imageBuffer, media.mimetype); // Send image to Gemini AI (from imageAnalyzer.js)
                console.log(`🤖 AI detected: ${aiResult}`); // Log AI detection result
            }
        }

        const office = detectOffice(officeText, aiResult); // Detect office from text and AI result (from detector.js)

        if (office) { // Check if an office was detected
            markAsReported(office); // Mark office as reported (from tracker.js)
            console.log(`📌 Office reported: ${office}`); // Log the detected office
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