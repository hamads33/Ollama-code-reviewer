require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { reviewerPrompt, debuggerPrompt } = require('./promptTemplates');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 4000;
const PROVIDER = (process.env.PROVIDER || 'ollama').toLowerCase();
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'codellama:7b';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

app.get('/api/health', (req, res) => res.json({ status: 'ok', provider: PROVIDER }));

app.post('/api/analyze', async (req, res) => {
  try {
    const { code, language = 'javascript', mode = 'review', options = {} } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing code string in request body.' });
    }
    const prompt = (mode === 'debug') ? debuggerPrompt(code, language, options) : reviewerPrompt(code, language, options);
    if (PROVIDER === 'openai') {
      if (!OPENAI_API_KEY) return res.status(400).json({ error: 'OPENAI_API_KEY not set in .env' });
      const payload = {
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.0,
        max_tokens: 800
      };
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) {
        const text = await resp.text();
        return res.status(502).json({ error: 'OpenAI API error', details: text });
      }
      const data = await resp.json();
      const raw = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || '';
      return sendParsed(raw, res);
    } else {
      // Ollama local API
      const ollamaUrl = 'http://localhost:11434/api/generate';
      const body = {
        model: OLLAMA_MODEL,
        prompt,
        max_tokens: 800,
        temperature: 0.0
      };
      const resp = await fetch(ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!resp.ok) {
        const text = await resp.text();
        return res.status(502).json({ error: 'Ollama API error', details: text });
      }
      // Ollama streams one JSON object per line (ndjson)
      const rawStream = await resp.text();
      let responseText = "";
      for (const line of rawStream.split("\n")) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          if (obj.response) responseText += obj.response;
        } catch (err) {
          // ignore lines that aren't JSON
        }
      }
      return sendParsed(responseText, res);
    }
  } catch (err) {
    console.error('Server error', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

function sendParsed(rawText, res) {
  let parsed = null;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      try {
        parsed = JSON.parse(rawText.slice(firstBrace, lastBrace + 1));
      } catch (err2) {
        return res.json({ success: true, parsed: null, raw: rawText, warning: 'Could not parse assistant response as JSON.' });
      }
    } else {
      return res.json({ success: true, parsed: null, raw: rawText, warning: 'Assistant did not return JSON.' });
    }
  }
  return res.json({ success: true, parsed, raw: rawText });
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT} (provider=${PROVIDER})`);
});
