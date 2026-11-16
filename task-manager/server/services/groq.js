/**
 * Groq AI Service for Task Description Generation
 * Uses native fetch with AbortController timeout.
 * Zero external AI SDK dependencies.
 */
async function generateDescription(title) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_key_here' || apiKey === 'your_groq_api_key_here') {
    throw new Error('GROQ_API_KEY is not configured on the server');
  }

  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS) || 8000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You write concise task descriptions for a to-do app. Reply with 1–2 plain sentences, no markdown, no quotes, no preamble.'
          },
          {
            role: 'user',
            content: `Task: ${title.trim()}`
          }
        ],
        temperature: 0.5,
        max_tokens: 120
      }),
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Groq API returned HTTP ${response.status}: ${errText.slice(0, 100)}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content || !content.trim()) {
      throw new Error('Groq API returned an empty completion');
    }

    // Clean up, remove any stray outer quotes, and cap to 300 characters
    const cleaned = content.trim().replace(/^["']|["']$/g, '');
    return cleaned.slice(0, 300);
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

module.exports = {
  generateDescription
};
