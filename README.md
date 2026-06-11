# AI Mail Assistant for Gmail

## Overview

AI Mail Assistant for Gmail is a Chrome Extension that integrates directly into the Gmail interface to help users write professional emails faster and more effectively. The extension leverages Large Language Models (LLMs) to provide grammar correction, AI-powered email generation, and reusable email templates without requiring users to leave Gmail.

The assistant appears as an interactive panel inside Gmail, enabling real-time email assistance during composition and communication workflows.

---

## Features

### Grammar & Spelling Correction

* Automatically detects and corrects grammatical, spelling, and punctuation errors.
* Improves clarity and readability while preserving the original meaning and tone.
* Provides polished, professional email content instantly.

### AI Email Generation

* Generates complete email drafts from simple prompts.
* Supports professional, formal, casual, and business communication styles.
* Creates structured emails with greetings, body content, and sign-offs.

### Reusable Email Templates

* Save frequently used messages and email formats.
* Quickly access stored templates for repetitive communication tasks.
* Improve productivity and reduce manual writing effort.

### Gmail Integration

* Seamlessly embedded inside the Gmail interface.
* Floating assistant panel accessible directly from the inbox and compose window.
* No need to switch between applications while drafting emails.

### Secure API-Based Processing

* Uses user-provided API keys for AI model access.
* Ensures users maintain full control over model usage and associated costs.
* Supports integration with modern LLM providers such as Gemini and Groq.

---

## Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* HTML
* CSS

### Browser Extension

* Chrome Extension (Manifest V3)
* CRXJS Vite Plugin

### AI Integration

* Google Gemini API
* Groq API

### Tools

* Git
* GitHub

---

## Project Architecture

1. User enters a prompt or email content.
2. Extension captures the input within Gmail.
3. Request is sent to the configured AI model.
4. AI generates corrections or email content.
5. Results are displayed directly inside the Gmail assistant panel.
6. User can copy, edit, and use the generated content instantly.

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd Gmail-AI-Assistant-Chrome-Extension
```

### Install Dependencies

```bash
npm install
```

### Build Extension

```bash
npm run build
```

### Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the generated `dist` folder

---

## Future Enhancements

* Smart email reply suggestions
* Sentiment analysis for email tone detection
* Multi-language email generation
* AI-powered email summarization
* Context-aware follow-up recommendations

---

## Author

Developed as an AI-powered productivity tool to streamline email communication and enhance writing efficiency within Gmail.
