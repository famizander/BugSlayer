# BugSlayer

BugSlayer is an AI-powered debugging tutor designed to help students learn from their mistakes instead of simply receiving corrected code. The app analyzes student code, finds bugs, explains why they happen, and offers progressive Socratic hints to guide learners toward the solution.

Built for programming education, BugSlayer focuses on helping students strengthen problem-solving skills, understand compiler/runtime errors, and improve their coding confidence over time.

## Why BugSlayer?

Students often get stuck when they receive vague error messages or are shown the final answer without understanding the reasoning behind it. BugSlayer addresses that challenge by:

- Detecting code issues in Python and C++
- Explaining the root cause of each bug
- Providing step-by-step hints rather than immediate answers
- Showing corrected code after the student works through the issue
- Encouraging learning through practice and reflection

## Features

- AI-assisted bug analysis with Gemini
- Socratic hint system for progressive guidance
- Student-friendly explanations tailored to the error
- Corrected code output for comparison
- Learning tips to prevent repeated mistakes
- Progress tracking and streaks
- Recent activity history
- Personalized account and settings experience
- Theme and localization support

## Tech Stack

- React 19
- TypeScript
- Vite
- Express
- Tailwind CSS
- Google GenAI SDK
- Node.js

## Project Structure

```text
BugSlayer/
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
├── public/
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── services/
│   └── types/
└── dist/ (generated during build)
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Gemini API key for AI-powered analysis

### Installation

1. Clone the repository:

```bash
git clone https://github.com/famizander/BugSlayer.git
cd BugSlayer
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Then update the values in `.env`:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

### Run the app

For local development:

```bash
npm run dev
```

The app will run on:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev      # Start the dev server with Vite + Express
npm run build    # Build the production bundle
npm run preview  # Preview the production build locally
npm run start    # Start the production server
npm run lint     # Type-check the project
npm run clean    # Remove generated build artifacts
```

## How It Works

The app sends submitted code to a backend API route at `/api/analyze`. If a Gemini API key is provided, BugSlayer uses the Google GenAI SDK to analyze the code and generate:

- compiler/runtime diagnostics
- bug summaries
- explanation text
- progressive hints
- corrected code
- learning recommendations

If the API is not configured, the server falls back to a safe non-AI response flow.

## Project Goals

BugSlayer aims to:

- reduce frustration for novice programmers
- teach debugging fundamentals
- make coding feedback more actionable
- create a learning experience that emphasizes understanding over copying

## License

This project is currently distributed without a formal license declaration in the repository metadata. If you plan to use or distribute it publicly, consider adding an explicit open-source license.

## Contributing

Contributions are welcome. If you'd like to improve the experience, add features, fix bugs, or expand subject coverage, feel free to open a pull request.

## Contact

Project repository:

https://github.com/famizander/BugSlayer

## Acknowledgements

BugSlayer is built to support coding education and help students become more confident, capable problem-solvers.
