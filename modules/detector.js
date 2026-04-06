// ============================================
// modules/detector.js - Office Detector Module
// Detects which main office a message belongs to
// using keyword matching from config.js
// ============================================

const { OFFICE_MAP, ALL_OFFICES } = require('../config'); // Import office mapping and office list from config.js

// Purpose: Searches message text for any known office keyword
// Parameters: text - the message string to search through
// Returns: main office name (string) or null if not found
function detectOfficeFromText(text) {
    if (!text) return null; // Return null if text is empty or undefined

    const keys = Object.keys(OFFICE_MAP); // Get all keywords from office map

    for (let i = 0; i < keys.length; i++) { // Loop through each keyword
        const keyword = keys[i]; // Get current keyword

        if (text.includes(keyword)) { // Check if message contains the keyword
            return OFFICE_MAP[keyword]; // Return the mapped main office name
        }
    }

    return null; // Return null if no keyword matched
}

// Purpose: Checks if message contains "সকল" (all) keyword
// meaning all sub-offices of that zone reported together
// Parameters: text - the message string to search through
// Returns: main office name (string) or null if not found
function detectAllOffices(text) {
    if (!text) return null; // Return null if text is empty

    if (!text.includes('সকল')) return null; // Return null if "সকল" not in message

    const keys = Object.keys(OFFICE_MAP); // Get all keywords from office map

    for (let i = 0; i < keys.length; i++) { // Loop through each keyword
        const keyword = keys[i]; // Get current keyword

        if (text.includes(keyword)) { // Check if message also contains a zone keyword
            return OFFICE_MAP[keyword]; // Return the mapped main office name
        }
    }

    return null; // Return null if no zone keyword found
}

// Purpose: Main detection function - combines text and AI result
// Parameters: text - message text, aiResult - office name from Gemini AI
// Returns: main office name (string) or null if not detected
function detectOffice(text, aiResult) {
    // First try: check AI result from imageAnalyzer.js
    if (aiResult) {
        const fromAI = detectOfficeFromText(aiResult); // Run keyword match on AI result (from imageAnalyzer.js)
        if (fromAI) return fromAI; // Return if AI result matched
    }

    // Second try: check message text directly
    const fromText = detectOfficeFromText(text); // Run keyword match on raw message text
    if (fromText) return fromText; // Return if text matched

    // Third try: check for "সকল" pattern
    const fromAll = detectAllOffices(text); // Check for bulk report pattern (from detector.js)
    if (fromAll) return fromAll; // Return if bulk pattern matched

    return null; // Return null if nothing matched
}

// Export all functions for use in other modules
module.exports = {
    detectOffice,          // Exported: main detection function
    detectOfficeFromText,  // Exported: keyword matching from text
    detectAllOffices,      // Exported: bulk report detection
};