// ============================================
// config.js - Central Configuration File
// All settings, mappings, and constants here
// ============================================

// --- Admin number for conflict resolution ---
const ADMIN_NUMBER = "8801XXXXXXXXX@c.us"; // Admin who decides message type conflicts

// --- Message Types Configuration ---
const MESSAGE_TYPES = [
    {
        type: "safety_drill",                          // Message type identifier
        keywords: ["সেফটি ড্রিল", "নিরাপত্তা ড্রিল", "Safety Register", "দৈনিক নিরাপত্তা"], // Keywords to detect this type
        sourceGroup: "NOA PBS Officers Group",         // Group to monitor for incoming messages
        destinationGroups: ["NOA PBS Officers Group"], // Groups to send report to
        destinationNumbers: [                          // Numbers to send report to privately
            "8801XXXXXXXXX@c.us",
            "8801XXXXXXXXX@c.us",
        ],
        trackLevel: "subOffice",                       // Track at sub-office level (43 offices)
        reportTime: "0 17 * * *",                      // Cron: every day at 5PM
        reminderTime: "0 16 * * *",                    // Cron: every day at 4PM (1 hour before)
    },
    {
        type: "power_report",                          // Message type identifier
        keywords: ["বন্ধ ফিডার", "বিদ্যুৎ বিহীন", "শাটডাউন", "ফিডারের সংখ্যা"], // Keywords to detect this type
        sourceGroup: "NOA PBS Night Report Group",     // Group to monitor for incoming messages
        destinationGroups: ["Managers Group"],         // Groups to send report to
        destinationNumbers: [                          // Numbers to send report to privately
            "8801XXXXXXXXX@c.us",
        ],
        trackLevel: "mainOffice",                      // Track at main office level (10 offices)
        reportTime: "0 23 * * *",                      // Cron: every day at 11PM
        reminderTime: "0 22 * * *",                    // Cron: every day at 10PM (1 hour before)
    },
];

// --- Office hierarchy with contacts ---
// contacts: main office contacts for reminders (always used regardless of trackLevel)
const OFFICES = {
    "সদর দপ্তর": {
        contacts: ["8801XXXXXXXXX@c.us"],              // Main office contacts for reminders
        subOffices: [
            { name: "সদর দপ্তর অভিযোগ কেন্দ্র" },
            { name: "কুতুবপুর অভিযোগ কেন্দ্র" },
            { name: "আলাইয়ারপুর অভিযোগ কেন্দ্র" },
            { name: "লন্ডন মার্কেট অভিযোগ কেন্দ্র" },
        ]
    },
    "চাটখিল জোনাল অফিস": {
        contacts: ["8801XXXXXXXXX@c.us"],              // Main office contacts for reminders
        subOffices: [
            { name: "চাটখিল অভিযোগ কেন্দ্র" },
            { name: "খিলপাড়া অভিযোগ কেন্দ্র" },
            { name: "সাহাপুর অভিযোগ কেন্দ্র" },
            { name: "বদলকোট অভিযোগ কেন্দ্র" },
            { name: "শোল্লা অভিযোগ কেন্দ্র" },
        ]
    },
    "সোনাইমুড়ী জোনাল অফিস": {
        contacts: ["8801XXXXXXXXX@c.us"],              // Main office contacts for reminders
        subOffices: [
            { name: "সোনাইমুড়ী অভিযোগ কেন্দ্র" },
            { name: "আমিশাপাড়া এরিয়া অফিস" },
            { name: "বাংলাবাজার অভিযোগ কেন্দ্র" },
            { name: "কাশিপুর অভিযোগ কেন্দ্র" },
            { name: "দেওটি অভিযোগ কেন্দ্র" },
        ]
    },
    "সেনবাগ জোনাল অফিস": {
        contacts: ["8801XXXXXXXXX@c.us"],              // Main office contacts for reminders
        subOffices: [
            { name: "সেনবাগ অভিযোগ কেন্দ্র" },
            { name: "কানকিরহাট এরিয়া অফিস" },
            { name: "ফকিরহাট অভিযোগ কেন্দ্র" },
            { name: "সেবারহাট অভিযোগ কেন্দ্র" },
        ]
    },
    "কোম্পানীগঞ্জ জোনাল অফিস": {
        contacts: ["8801XXXXXXXXX@c.us"],              // Main office contacts for reminders
        subOffices: [
            { name: "কোম্পানীগঞ্জ অভিযোগ কেন্দ্র" },
            { name: "পেশকারহাট অভিযোগ কেন্দ্র" },
            { name: "সিরাজপুর অভিযোগ কেন্দ্র" },
            { name: "চর এলাহী অভিযোগ কেন্দ্র" },
            { name: "উড়িরচর অভিযোগ কেন্দ্র" },
            { name: "চৌধুরী বাজার অভিযোগ কেন্দ্র" },
        ]
    },
    "কবিরহাট জোনাল অফিস": {
        contacts: ["8801XXXXXXXXX@c.us"],              // Main office contacts for reminders
        subOffices: [
            { name: "কবিরহাট অভিযোগ কেন্দ্র" },
            { name: "তাকিয়াবাজার অভিযোগ কেন্দ্র" },
            { name: "ধানসিঁড়ি অভিযোগ কেন্দ্র" },
            { name: "ফরাজিবাজার অভিযোগ কেন্দ্র" },
        ]
    },
    "সোনাপুর জোনাল অফিস": {
        contacts: ["8801XXXXXXXXX@c.us"],              // Main office contacts for reminders
        subOffices: [
            { name: "সোনাপুর অভিযোগ কেন্দ্র" },
            { name: "দিনমনিরহাট অভিযোগ কেন্দ্র" },
            { name: "মান্নাননগর অভিযোগ কেন্দ্র" },
            { name: "বাঁধেরহাট অভিযোগ কেন্দ্র" },
            { name: "ওদারহাট অভিযোগ কেন্দ্র" },
            { name: "অন্ডারচর অভিযোগ কেন্দ্র" },
        ]
    },
    "সুবর্ণচর জোনাল অফিস": {
        contacts: ["8801XXXXXXXXX@c.us"],              // Main office contacts for reminders
        subOffices: [
            { name: "সুবর্ণচর অভিযোগ কেন্দ্র" },
            { name: "ভূঁইয়ারহাট অভিযোগ কেন্দ্র" },
            { name: "আক্তারমিয়ারহাট অভিযোগ কেন্দ্র" },
            { name: "হাতিয়াবাজার অভিযোগ কেন্দ্র" },
        ]
    },
    "আমিনবাজার জোনাল অফিস": {
        contacts: ["8801XXXXXXXXX@c.us"],              // Main office contacts for reminders
        subOffices: [
            { name: "আমিনবাজার অভিযোগ কেন্দ্র" },
            { name: "পদিপাড়া অভিযোগ কেন্দ্র" },
            { name: "রাজগঞ্জ অভিযোগ কেন্দ্র" },
            { name: "ছয়ানী অভিযোগ কেন্দ্র" },
        ]
    },
    "নয়নপুর সাব-জোনাল অফিস": {
        contacts: ["8801XXXXXXXXX@c.us"],              // Main office contacts for reminders
        subOffices: [
            { name: "নয়নপুর অভিযোগ কেন্দ্র" },
        ]
    },
};

// --- Flat list of all main offices for easy lookup ---
const ALL_MAIN_OFFICES = Object.keys(OFFICES); // Extract main office names

// --- Flat list of all sub-offices for easy lookup ---
const ALL_SUB_OFFICES = Object.values(OFFICES)  // Get all zone objects
    .flatMap(zone => zone.subOffices)            // Flatten to single array
    .map(office => office.name);                 // Extract just the names

// --- Export all settings ---
module.exports = {
    ADMIN_NUMBER,       // Exported: admin number for conflict resolution
    MESSAGE_TYPES,      // Exported: all message type configurations
    OFFICES,            // Exported: full office hierarchy with contacts
    ALL_MAIN_OFFICES,   // Exported: flat list of all main office names
    ALL_SUB_OFFICES,    // Exported: flat list of all sub-office names
};