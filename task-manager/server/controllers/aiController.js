const { generateDescription } = require('../services/groq');

async function handleGenerateDescription(req, res) {
  const { title } = req.body || {};

  try {
    const description = await generateDescription(title);
    return res.status(200).json({
      description,
      fallback: false
    });
  } catch (err) {
    // Log internal error safely without sensitive headers or keys
    console.warn(`[AI Service Warning] Description generation failed: ${err.message}`);

    // Graceful Degradation: HTTP 200 with fallback flag so client can fall back to manual input
    return res.status(200).json({
      description: '',
      fallback: true,
      message: 'AI suggestion is unavailable right now. You can write the description yourself.'
    });
  }
}

module.exports = {
  handleGenerateDescription
};
