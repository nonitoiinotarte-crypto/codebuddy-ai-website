# CodeBuddy AI — Coding Helper Website

A responsive AI chatbot website for writing, explaining, debugging, and reviewing code across many programming languages and frameworks.

## Features
- Chat interface with conversation history during the current session
- Modes: Ask anything, Generate code, Debug, Explain, Review
- Language selector for Python, JavaScript, TypeScript, PHP, Java, C/C++, C#, Go, Rust, SQL, HTML/CSS, React, Node.js, Laravel, and more
- Copy generated code snippets
- Mobile-friendly layout
- API key stays on the server, not in browser JavaScript

## Requirements
- Node.js 18 or newer
- An OpenAI API key with API access and billing/credits enabled

## Run locally
1. Extract the ZIP and open a terminal in the project folder.
2. Install packages:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`.
4. Open `.env` and set `OPENAI_API_KEY=your_real_key`.
5. Start:
   ```bash
   npm start
   ```
6. Open http://localhost:3000

Never commit `.env` or publish your API key. The included `.gitignore` excludes `.env`.

## Deploy
Deploy as a Node.js web service on a host that supports Node.js:
- Build/install command: `npm install`
- Start command: `npm start`
- Add environment variables in the host dashboard:
  - `OPENAI_API_KEY` = your secret API key
  - `OPENAI_MODEL` = `gpt-4o-mini` (optional)
  - `NODE_ENV` = `production` (optional)

The API key must be configured on the server for chat to work. Hosting may be free or paid depending on provider, and AI API usage may cost money separately. Check the provider's current pricing before use.

## Notes
- “All programming languages” means the assistant can help with a wide range of languages, but output quality varies and generated code should be reviewed and tested.
- This starter project does not execute user-submitted code. It only sends the conversation to the configured AI API.
- Add rate limiting, authentication, and usage monitoring before sharing widely to prevent API abuse.
