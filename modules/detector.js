// ============================================
// modules/detector.js - Office Detector Module
// Detects which sub-office a message belongs to
// using keyword matching from config.js
// ============================================

const { OFFICE_MAP, ALL_OFFICES } = require('../config'); // Import office mapping and office list from config.js

// Purpose: Searches message text for any known sub-office keyword
// Parameters: text - the message string to search through
// Returns: sub-office name (string) or null if not found
function detectOfficeFromText(text) {
    if (!text) return null; // Return null if text is empty or undefined

    for (const office of ALL_OFFICES) { // Loop through each sub-office in the full list
        // Extract short keyword from sub-office name (remove "অভিযোগ কেন্দ্র" and "এরিয়া অফিস")
        const keyword = office
            .replace('অভিযোগ কেন্দ্র', '') // Remove "অভিযোগ কেন্দ্র" suffix
            .replace('এরিয়া অফিস', '')     // Remove "এরিয়া অফিস" suffix
            .trim();                         // Remove extra spaces

        if (text.includes(keyword)) { // Check if message contains the keyword
            return office; // Return the full sub-office name
        }
    }

    return null; // Return null if no keyword matched
}

// Purpose: Checks if message contains "সকল" (all) keyword
// meaning all sub-offices of that zone reported together
// Parameters: text - the message string to search through
// Returns: array of sub-office names under that zone, or null
function detectAllOffices(text) {
    if (!text) return null; // Return null if text is empty
    if (!text.includes('সকল')) return null; // Return null if "সকল" not in message

    // Find which main zone is mentioned
    const zoneKeywords = Object.keys(OFFICE_MAP); // Get all zone keywords from config.js

    for (const keyword of zoneKeywords) { // Loop through each zone keyword
        if (text.includes(keyword)) { // Check if message contains zone keyword
            const mainOffice = OFFICE_MAP[keyword]; // Get main office name (from config.js)

            // Find all sub-offices under this main office
            const subOffices = ALL_OFFICES.filter(office => {
                const shortKey = office
                    .replace('অভিযোগ কেন্দ্র', '') // Remove suffix
                    .replace('এরিয়া অফিস', '')     // Remove suffix
                    .trim();                         // Remove spaces
                return OFFICE_MAP[shortKey] === mainOffice; // Match sub-office to main office
            });

            return subOffices.length > 0 ? subOffices : null; // Return sub-offices or null
        }
    }

    return null; // Return null if no zone keyword found
}

// Purpose: Main detection function - combines text and AI result
// Parameters: text - message text, aiResult - office name from Gemini AI
// Returns: sub-office name (string), array of names, or null if not detected
function detectOffice(text, aiResult) {
    // First try: check AI result from imageAnalyzer.js
    if (aiResult) {
        const fromAI = detectOfficeFromText(aiResult); // Run keyword match on AI result (from imageAnalyzer.js)
        if (fromAI) return fromAI; // Return if AI result matched
    }

    // Second try: check for "সকল" bulk report pattern
    const fromAll = detectAllOffices(text); // Check for bulk report pattern (from detector.js)
    if (fromAll) return fromAll; // Return array of sub-offices if bulk pattern matched

    // Third try: check message text directly
    const fromText = detectOfficeFromText(text); // Run keyword match on raw message text
    if (fromText) return fromText; // Return if text matched

    return null; // Return null if nothing matched
}

// Export all functions for use in other modules
module.exports = {
    detectOffice,          // Exported: main detection function
    detectOfficeFromText,  // Exported: keyword matching from text
    detectAllOffices,      // Exported: bulk report detection
};