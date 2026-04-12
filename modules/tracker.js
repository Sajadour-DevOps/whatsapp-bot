// ============================================
// modules/tracker.js - Office Report Tracker Module
// Tracks which offices have reported today
// Supports multiple message types separately
// Resets automatically at midnight
// ============================================

const { OFFICES, ALL_MAIN_OFFICES, ALL_SUB_OFFICES } = require('../config'); // Import office lists from config.js

// --- In-memory store: tracks reported offices per message type ---
const reportedByType = {}; // { "safety_drill": Set(), "power_report": Set() }

// Purpose: Initializes tracker for a message type if not exists
// Parameters: type - message type string (e.g. "safety_drill")
function initType(type) {
    if (!reportedByType[type]) { // Check if type already initialized
        reportedByType[type] = new Set(); // Create new Set for this type
    }
}

// Purpose: Marks an office as reported for a specific message type
// Parameters: type - message type, officeName - office name to mark
function markAsReported(type, officeName) {
    if (!officeName) return; // Do nothing if office name is empty
    initType(type); // Initialize type if not exists (from tracker.js)
    reportedByType[type].add(officeName); // Add office to reported set
    console.log(`✅ [${type}] Marked as reported: ${officeName}`); // Log the reported office
}

// Purpose: Returns list of offices that have NOT reported for a specific type
// Parameters: type - message type, trackLevel - "subOffice" or "mainOffice"
// Returns: array of office names that are missing
function getMissingOffices(type, trackLevel) {
    initType(type); // Initialize type if not exists (from tracker.js)
    const officeList = trackLevel === 'subOffice' ? ALL_SUB_OFFICES : ALL_MAIN_OFFICES; // Choose list based on trackLevel (from config.js)
    return officeList.filter(office => !reportedByType[type].has(office)); // Filter unreported offices
}

// Purpose: Returns list of offices that HAVE reported for a specific type
// Parameters: type - message type
// Returns: array of office names that have reported
function getReportedOffices(type) {
    initType(type); // Initialize type if not exists (from tracker.js)
    return [...reportedByType[type]]; // Convert Set to array and return
}

// Purpose: Returns main office contacts for reminder
// Parameters: mainOfficeName - name of the main office
// Returns: array of contact numbers
function getMainOfficeContacts(mainOfficeName) {
    const office = OFFICES[mainOfficeName]; // Find office in config (from config.js)
    if (!office) return []; // Return empty if not found
    return office.contacts || []; // Return contacts array
}

// Purpose: Returns main office name for a given sub-office
// Parameters: subOfficeName - sub-office name
// Returns: main office name or null
function getMainOfficeForSubOffice(subOfficeName) {
    for (const [mainOffice, data] of Object.entries(OFFICES)) { // Loop through all main offices (from config.js)
        const found = data.subOffices.find(s => s.name === subOfficeName); // Check if sub-office belongs here
        if (found) return mainOffice; // Return main office name if found
    }
    return null; // Return null if not found
}

// Purpose: Resets tracker for all types at midnight
function resetTracker() {
    Object.keys(reportedByType).forEach(type => { // Loop through all types
        reportedByType[type].clear(); // Clear reported offices for each type
    });
    console.log('🔄 Tracker reset for new day'); // Log the reset
}

// Purpose: Schedules automatic reset at midnight every day
function scheduleReset() {
    const now = new Date(); // Get current time
    const midnight = new Date(); // Create midnight time object
    midnight.setHours(24, 0, 0, 0); // Set time to next midnight

    const msUntilMidnight = midnight - now; // Calculate milliseconds until midnight

    setTimeout(() => { // Schedule reset at midnight
        resetTracker(); // Reset tracker (from tracker.js)
        setInterval(resetTracker, 24 * 60 * 60 * 1000); // Then reset every 24 hours
    }, msUntilMidnight);
}

// Export all functions for use in other modules
module.exports = {
    markAsReported,           // Exported: marks office as reported
    getMissingOffices,        // Exported: returns missing offices list
    getReportedOffices,       // Exported: returns reported offices list
    getMainOfficeContacts,    // Exported: returns main office contacts for reminder
    getMainOfficeForSubOffice,// Exported: returns main office for a sub-office
    resetTracker,             // Exported: resets tracker
    scheduleReset,            // Exported: schedules automatic midnight reset
};