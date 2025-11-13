# AI Code Reviewer / Debugger (Ollama )

## What this is
A minimal Node.js + Express prototype that sends code to a local Ollama model (default) or to OpenAI (optional).
Frontend uses CodeMirror for editing. UI supports Review and Debug modes.

## Quick start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env`:
   - If using Ollama (recommended, free/local), ensure Ollama is installed and a model is pulled:
     ```bash
     # install ollama per https://ollama.com
     ollama pull codellama:7b
     ollama pull mistral
     ```
   

3. Run:
   ```bash
   npm run start
   ```
   Open http://localhost:4000

## Notes
- This project **does not execute user code**. It only sends code as text to the LLM.
- Ollama default API endpoint: http://localhost:11434/api/generate
- If using OpenAI, ensure API key is set.
