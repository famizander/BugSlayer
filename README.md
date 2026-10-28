# BugSlayer

BugSlayer is an AI-powered debugging tutor that helps students learn how to fix code instead of just copying the answer. It analyzes submissions, identifies bugs, explains what went wrong, and delivers guided hints that encourage problem-solving and deeper understanding.

## Why students use it

- Understand coding errors without feeling stuck
- Learn from mistakes with clear explanations
- Get progressive Socratic hints instead of instant answers
- Compare against corrected code to reinforce learning
- Build confidence through practice and feedback

## Features

- AI-powered bug analysis using Gemini
- Python and C++ code review
- Step-by-step debugging hints
- Student-friendly explanations
- Corrected code suggestions
- Progress tracking, streaks, and learning history
- Clean React + TypeScript web interface

## Tech Stack

- React
- TypeScript
- Vite
- Express
- Tailwind CSS
- Google GenAI SDK

## Run locally

```bash
git clone https://github.com/famizander/BugSlayer.git
cd BugSlayer
npm install
cp .env.example .env
npm run dev
```

Add your Gemini key in `.env`:

```env
GEMINI_API_KEY="your_key_here"
APP_URL="http://localhost:3000"
```

## Project goals

BugSlayer makes programming education more interactive, supportive, and effective by turning debugging into a learning experience rather than a dead end.

## Repository

https://github.com/famizander/BugSlayer
