// ============================================
// modules/tracker.js - Office Report Tracker Module
// Tracks which offices have reported today
// Resets automatically at midnight
// ============================================

const { ALL_OFFICES } = require('../config'); // Import full office list from config.js

// In-memory store: tracks reported offices for today
let reportedOffices = new Set(); // Using Set to avoid duplicate entries

// Purpose: Marks an office as reported for today
// Parameters: officeName - the main office name to mark as reported
function markAsReported(officeName) {
    if (!officeName) return; // Do nothing if office name is empty
    reportedOffices.add(officeName); // Add office to reported set
    console.log(`✅ Marked as reported: ${officeName}`); // Log the reported office
}

// Purpose: Returns list of offices that have NOT reported today
// Returns: array of office names that are missing
function getMissingOffices() {
    return ALL_OFFICES.filter(office => !reportedOffices.has(office)); // Filter offices not in reported set
}

// Purpose: Returns list of offices that HAVE reported today
// Returns: array of office names that have reported
function getReportedOffices() {
    return [...reportedOffices]; // Convert Set to array and return
}

// Purpose: Resets the tracker at midnight for a new day
function resetTracker() {
    reportedOffices.clear(); // Clear all reported offices
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
    markAsReported,     // Exported: marks office as reported
    getMissingOffices,  // Exported: returns missing offices list
    getReportedOffices, // Exported: returns reported offices list
    resetTracker,       // Exported: resets tracker
    scheduleReset,      // Exported: schedules automatic midnight reset
};