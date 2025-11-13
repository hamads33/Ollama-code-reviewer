// promptTemplates.js
function reviewerPrompt(code, language, options = {}) {
  const maxIssues = options.maxIssues || 8;
  return `You are an expert software engineer and code reviewer. Be concise, specific, and actionable. Return JSON in the exact schema requested.

Task: Review the following ${language} code for readability, security, best practices, performance, and edge cases. Keep suggestions actionable.

Return a JSON object with these keys:
{
  "summary": "<one-line summary>",
  "issues": [
    {"title": "<short title>", "description": "<detailed explanation>", "severity": "low|medium|high", "line_numbers": [<int>,...]}
  ],
  "suggestions": ["<patch-style suggestion or code snippet>", ...],
  "confidence": "<0-100>"
}

Code (${language}):

\`\`\`
${code}
\`\`\`

Only return valid JSON. Limit 'issues' to at most ${maxIssues} items.`;
}

function debuggerPrompt(code, language, options = {}) {
  const maxHints = options.maxHints || 6;
  return `You are a pragmatic debugging assistant. Focus on identifying logic and runtime issues and provide minimal reproducible steps and fixes. Return JSON in the schema requested.

Task: Find bugs (syntax or logic) in the following ${language} code and suggest fixes.

Return JSON:
{
  "summary": "<one-line summary of bug>",
  "errors_found": [
    {"description":"<what's wrong>", "line_numbers":[<int>], "type":"syntax|logic|runtime", "possible_fix":"<fix or code snippet>"}
  ],
  "reproduction_steps": ["step1", "step2"],
  "confidence":"<0-100>"
}

Code:

\`\`\`
${code}
\`\`\`

Only return JSON. Provide up to ${maxHints} errors/hints.`;
}

module.exports = { reviewerPrompt, debuggerPrompt };
