// ============================================
// modules/client.js - WhatsApp Client Module
// Handles WhatsApp connection, QR code, and session
// ============================================

const { Client, LocalAuth } = require('whatsapp-web.js'); // Import WhatsApp client and auth strategy
const qrcode = require('qrcode-terminal'); // Import QR code generator for terminal

// Purpose: Creates and configures the WhatsApp client
// Returns: configured client object
function createClient() {
    const client = new Client({
        authStrategy: new LocalAuth(), // Save session locally so QR scan is only needed once
        puppeteer: {
            args: [
                '--no-sandbox',              // Required for WSL/Linux environment
                '--disable-setuid-sandbox',  // Required for WSL/Linux environment
                '--disable-dev-shm-usage'    // Required for cloud servers with limited shared memory
            ] // Required flags for running in WSL/Linux
        }
    });

    return client; // Return the configured client
}

// Purpose: Registers QR code event - shows QR in terminal for scanning
// Parameters: client - the WhatsApp client object
function onQR(client) {
    client.on('qr', (qr) => { // Listen for QR code event
        qrcode.generate(qr, { small: true }); // Display QR code in terminal
        console.log('QR কোড scan করো WhatsApp দিয়ে!'); // Prompt user to scan
    });
}

// Purpose: Registers ready event - fires when WhatsApp is connected
// Parameters: client - the WhatsApp client object
function onReady(client) {
    client.on('ready', () => { // Listen for ready event
        console.log('✅ WhatsApp connected successfully!'); // Log success message
    });
}

// Purpose: Initializes the client and starts the connection
// Parameters: client - the WhatsApp client object
function startClient(client) {
    client.initialize(); // Start the WhatsApp Web connection
}

// Export all functions for use in other modules
module.exports = {
    createClient,  // Exported: creates WhatsApp client
    onQR,          // Exported: handles QR code display
    onReady,       // Exported: handles ready event
    startClient,   // Exported: starts the client
};