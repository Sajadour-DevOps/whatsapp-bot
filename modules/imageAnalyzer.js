// ============================================
// modules/imageAnalyzer.js - Image Analyzer Module
// Sends image to Gemini AI and extracts office name
// ============================================

const { GoogleGenerativeAI } = require('@google/generative-ai'); // Import Gemini AI library
const fs = require('fs'); // Import file system module for reading files

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Get API key from environment variable
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY); // Initialize Gemini AI with API key

// Purpose: Converts image buffer to base64 format for Gemini API
// Parameters: imageBuffer - raw image data in buffer format
// Returns: base64 encoded string of the image
function bufferToBase64(imageBuffer) {
    return imageBuffer.toString('base64'); // Convert buffer to base64 string
}

// Purpose: Sends image to Gemini AI and asks which office name is in it
// Parameters: imageBuffer - raw image data, mimeType - image type (e.g. image/jpeg)
// Returns: office name string extracted by AI, or null if not found
async function analyzeImage(imageBuffer, mimeType = 'image/jpeg') {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Load Gemini Flash model (free tier)

        const base64Image = bufferToBase64(imageBuffer); // Convert image to base64 (from imageAnalyzer.js)

        const imagePart = {
            inlineData: {
                data: base64Image,   // Base64 image data
                mimeType: mimeType   // Image format type
            }
        };

        // Prompt asking Gemini to extract office name from image
        const prompt = `এই ছবিতে কোন অফিস বা অভিযোগ কেন্দ্রের নাম আছে? 
        শুধু অফিসের নামটা বলো, অন্য কিছু বলো না। 
        যদি কোনো অফিসের নাম না থাকে তাহলে "none" বলো।`;

        const result = await model.generateContent([prompt, imagePart]); // Send image and prompt to Gemini AI
        const response = result.response.text().trim(); // Extract text response from AI

        if (response.toLowerCase() === 'none') return null; // Return null if AI found no office name

        return response; // Return the extracted office name

    } catch (error) {
        console.error('Gemini AI error:', error.message); // Log error message
        return null; // Return null if AI call failed
    }
}

// Export functions for use in other modules
module.exports = {
    analyzeImage, // Exported: sends image to Gemini AI and returns office name
};