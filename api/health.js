const {
  DEFAULT_MODEL,
  getRuntimeEnvironment,
} = require('./_lib/gemini');

module.exports = function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Método no permitido.' });
  }

  return response.status(200).json({
    configured: Boolean(getRuntimeEnvironment('GEMINI_API_KEY')),
    model: getRuntimeEnvironment('GEMINI_MODEL') || DEFAULT_MODEL,
  });
};
