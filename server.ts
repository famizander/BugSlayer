import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini if key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// API Route: AI-powered code & error analysis
app.post('/api/analyze', async (req, res) => {
  const { code, language, expectedOutput } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  // If Gemini API is available, leverage it for rich Socratic diagnostics
  if (ai && geminiApiKey) {
    try {
      const prompt = `You are BugSlayer, an AI programming tutor for students learning ${language === 'cpp' ? 'C++' : 'Python'}.
Analyze this code submission. Carefully inspect the ENTIRE code for ALL bugs, syntax errors, missing semicolons, unmatched braces, and logical errors. DO NOT stop at just the first bug.

Student's code:
\`\`\`${language}
${code}
\`\`\`

Expected output: "${expectedOutput || ''}"

Return a strict JSON object with these exact keys:
{
  "status": "Error Found" | "Fixed" | "No Errors",
  "compilerOutput": "Combined compiler error or interpreter traceback for all errors found",
  "expectedOutput": "${expectedOutput || ''}",
  "actualOutput": "What the program produced or why it stopped",
  "errorSummary": "Summary of all bugs found (e.g. 'Found 2 bugs: Missing semicolon on line 4, Missing semicolon on line 8')",
  "bugs": [
    {
      "id": "bug-1",
      "line": 4,
      "errorSummary": "Short 1-line label of this bug",
      "compilerOutput": "Exact compiler diagnostic for this bug",
      "hints": [
        "Hint 1: General high-level Socratic clue pointing to the area without giving the answer",
        "Hint 2: More specific line inspection clue",
        "Hint 3: Concrete clue helping student finish the fix"
      ],
      "explanation": "Clear explanation of this bug"
    }
  ],
  "hints": [
    "Bug 1 - Hint 1: ...",
    "Bug 1 - Hint 2: ...",
    "Bug 1 - Hint 3: ...",
    "Bug 2 - Hint 1: ...",
    "Bug 2 - Hint 2: ...",
    "Bug 2 - Hint 3: ..."
  ],
  "explanation": "Clear, student-friendly explanation of why these errors happen and how to resolve all of them",
  "correctedCode": "The full working corrected code fixing ALL bugs",
  "learningTips": [
    "Tip 1 to prevent these mistakes in the future",
    "Tip 2"
  ],
  "progressPercent": 65
}

CRITICAL RULES:
1. If there are multiple bugs, identify ALL of them in 'bugs'.
2. For EACH bug, you MUST provide EXACTLY 3 progressive Socratic hints (Clue 1: high level, Clue 2: line clue, Clue 3: concrete fix).
3. 'hints' must contain all the 3 hints for Bug 1, 3 hints for Bug 2, etc. (3 hints per bug).
4. 'correctedCode' MUST resolve ALL bugs so the code compiles and runs cleanly.
5. In C++, never put a semicolon after 'int main()'. Function definitions require '{ ... }'.
6. In C++, never put a semicolon at the end of a line that ends with continuation operators like '&&', '||', '+', '-', '*', '/', ',', '<<', etc.
7. In C++, check for missing '#include <iostream>' when using 'cout', 'cin', or 'endl'.
8. In C++, check for bitwise vs logical operator mistakes: e.g. using single '&' instead of logical '&&' when chaining boolean conditions.
9. In C++, check stream operators: 'cin' uses extraction operator '>>' (never '<<'); 'cout' uses insertion operator '<<' (never '>>').`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            "You are BugSlayer, an expert AI programming tutor. When analyzing code, identify all bugs present. For each bug, provide exactly 3 progressive Socratic hints. Always provide full corrected code fixing all bugs.",
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json(parsed);
    } catch (err) {
      console.warn('Gemini analysis failed or fallback triggered:', err);
      // Fall through to local diagnosis
    }
  }

  // Fallback diagnostic if no Gemini API key is configured
  return res.status(200).json({ fallback: true });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BugSlayer server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
