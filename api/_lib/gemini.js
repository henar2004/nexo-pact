const fs = require('fs');
const path = require('path');

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const DEFAULT_MODEL = 'gemini-3.5-flash';

function readLocalEnvironment() {
  const candidates = [
    path.join(process.cwd(), '.env.local'),
    path.resolve(__dirname, '..', '..', '.env.local'),
  ];

  for (const candidate of [...new Set(candidates)]) {
    try {
      if (!fs.existsSync(candidate)) continue;

      const values = {};
      const lines = fs.readFileSync(candidate, 'utf8').split(/\r?\n/);

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;

        const separatorIndex = trimmedLine.indexOf('=');
        if (separatorIndex < 1) continue;

        const name = trimmedLine.slice(0, separatorIndex).trim();
        let value = trimmedLine.slice(separatorIndex + 1).trim();

        if (
          value.length >= 2 &&
          ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'")))
        ) {
          value = value.slice(1, -1);
        }

        values[name] = value;
      }

      return values;
    } catch {
      // En producción el archivo local no existe; Vercel aporta process.env.
    }
  }

  return {};
}

const localEnvironment = readLocalEnvironment();

function getRuntimeEnvironment(name) {
  return process.env[name] || localEnvironment[name] || '';
}

function extractOutputText(payload) {
  const textBlocks = [];

  for (const step of payload.steps || []) {
    if (step.type !== 'model_output') continue;

    for (const block of step.content || []) {
      if (block.type === 'text' && typeof block.text === 'string') {
        textBlocks.push(block.text);
      }
    }
  }

  return textBlocks.join('\n').trim();
}

function parseStructuredText(text) {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  return JSON.parse(cleaned);
}

function createApiError(status, payload) {
  const apiMessage =
    payload?.error?.message ||
    payload?.message ||
    'Gemini no pudo completar la petición.';

  if (status === 400 || status === 401 || status === 403) {
    return new Error(`Gemini rechazó la credencial o la petición: ${apiMessage}`);
  }

  if (status === 429) {
    return new Error('Se ha alcanzado temporalmente el límite de la API de Gemini.');
  }

  return new Error(`Error de Gemini (${status}): ${apiMessage}`);
}

async function callGemini({
  systemInstruction,
  input,
  responseSchema,
}) {
  const apiKey = getRuntimeEnvironment('GEMINI_API_KEY');
  const model = getRuntimeEnvironment('GEMINI_MODEL') || DEFAULT_MODEL;

  if (!apiKey) {
    const error = new Error(
      'Falta GEMINI_API_KEY. Añádela a .env.local y reinicia vercel dev.'
    );
    error.code = 'MISSING_API_KEY';
    throw error;
  }

  const body = {
    model,
    store: false,
    input,
    system_instruction: systemInstruction,
  };

  if (responseSchema) {
    body.response_format = {
      type: 'text',
      mime_type: 'application/json',
      schema: responseSchema,
    };
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
      'Api-Revision': '2026-05-20',
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createApiError(response.status, payload);
  }

  const text = extractOutputText(payload);

  if (!text) {
    throw new Error('Gemini terminó la interacción sin devolver texto.');
  }

  return {
    text,
    data: responseSchema ? parseStructuredText(text) : null,
    interactionId: payload.id || null,
    model: payload.model || model,
    usage: payload.usage || null,
  };
}

module.exports = {
  DEFAULT_MODEL,
  callGemini,
  getRuntimeEnvironment,
};
