// ============================================
// modules/imageAnalyzer.js - AI Analyzer Module
// Sends both text and image to Gemini AI
// Detects office name and message type
// Works even without image (text-only messages)
// ============================================

const { GoogleGenerativeAI } = require('@google/generative-ai'); // Import Gemini AI library
const { ALL_MAIN_OFFICES, ALL_SUB_OFFICES, MESSAGE_TYPES } = require('../config'); // Import office lists and message types from config.js

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Get API key from environment variable
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY); // Initialize Gemini AI with API key

// Purpose: Converts image buffer to base64 format for Gemini API
// Parameters: imageBuffer - raw image data in buffer format
// Returns: base64 encoded string of the image
function bufferToBase64(imageBuffer) {
    return imageBuffer.toString('base64'); // Convert buffer to base64 string
}

// Purpose: Sends text and/or image to Gemini AI to extract office name
// Parameters: text - message text, imageBuffer - image data (can be null), mimeType - image type, trackLevel - "subOffice" or "mainOffice"
// Returns: matched office name from office list, or null if not found
async function analyzeWithAI(text = '', imageBuffer = null, mimeType = 'image/jpeg', trackLevel = 'subOffice') {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' }); // Load free tier model

        // Choose office list based on trackLevel
        const officeList = trackLevel === 'subOffice' ? ALL_SUB_OFFICES : ALL_MAIN_OFFICES; // Select correct office list (from config.js)
        const officeListString = officeList.join('\n'); // Convert array to newline-separated string

        // Prompt asking Gemini to match office name from the provided list
        const prompt = `নিচের অফিসের তালিকা থেকে message-এ কোন অফিসের নাম আছে তা খুঁজে বের করো।
শুধু তালিকা থেকে exact নামটা বলো, অন্য কিছু বলো না।
যদি কোনো অফিসের নাম না থাকে তাহলে শুধু "none" বলো।

অফিসের তালিকা:
${officeListString}

message টেক্সট:
${text}`; // Include message text and office list in prompt

        const parts = [prompt]; // Start with text prompt

        if (imageBuffer) { // Check if image is provided
            const base64Image = bufferToBase64(imageBuffer); // Convert image to base64 (from imageAnalyzer.js)
            parts.push({
                inlineData: {
                    data: base64Image,  // Base64 image data
                    mimeType: mimeType  // Image format type
                }
            }); // Add image to parts array
        }

        const result = await model.generateContent(parts); // Send text and/or image to Gemini AI
        const response = result.response.text().trim(); // Extract text response from AI

        if (response.toLowerCase() === 'none') return null; // Return null if AI found no office name

        // Validate: check if AI response matches any office in our list
        const matched = officeList.find(office =>
            response.includes(office) || office.includes(response) // Check both directions
        ); // Find matching office from list

        return matched || null; // Return matched office name or null

    } catch (error) {
        console.error('Gemini AI error:', error.message); // Log error message
        return null; // Return null if AI call failed
    }
}

// Export functions for use in other modules
module.exports = {
    analyzeWithAI, // Exported: sends text and/or image to Gemini AI and returns office name
};