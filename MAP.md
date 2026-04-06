# WhatsApp Bot - Project MAP

## Project Structure
whatsapp-bot/
├── index.js              → Entry point, starts the bot
├── config.js             → All settings, office mapping, recipients
├── MAP.md                → This file, project structure map
├── modules/
│   ├── client.js         → WhatsApp client setup and connection
│   ├── detector.js       → Detects which office sent the message
│   ├── imageAnalyzer.js  → Sends image to Gemini AI, extracts office name
│   ├── tracker.js        → Tracks which offices have reported today
│   └── reporter.js       → Sends missing office report at 5PM
└── diagrams/
└── dataflow.md       → Data flow diagram

## Module Responsibilities

| File | Responsibility |
|------|---------------|
| `index.js` | Starts bot, listens for messages, calls other modules |
| `config.js` | Single source of truth for all settings |
| `modules/client.js` | WhatsApp Web connection, QR code, session management |
| `modules/detector.js` | Keyword matching to identify office from text |
| `modules/imageAnalyzer.js` | Gemini AI image analysis to extract office name |
| `modules/tracker.js` | Daily tracking of reported offices |
| `modules/reporter.js` | Scheduled 5PM report to recipients |

## Data Flow Summary
Message arrives (text + image)
↓
client.js receives the message
↓
imageAnalyzer.js → Gemini AI → extracts office name
↓
detector.js → maps name to main office
↓
tracker.js → marks office as reported
↓
reporter.js → at 5PM, sends missing offices list

## Dependencies
| Package | Purpose |
|---------|---------|
| `whatsapp-web.js` | WhatsApp automation |
| `qrcode-terminal` | Show QR code in terminal |
| `@google/generative-ai` | Gemini AI image analysis |
| `node-cron` | Schedule 5PM daily report |