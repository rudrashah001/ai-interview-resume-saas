import { GoogleGenerativeAI } from '@google/generative-ai';

export const getGeminiApiKey = () =>
  process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '';

export const isAiConfigured = () => Boolean(getGeminiApiKey());

/** @deprecated use isAiConfigured */
export const getOpenAI = () => (isAiConfigured() ? { apiKey: getGeminiApiKey() } : null);

const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
  'gemini-2.0-flash',
];

function getModelCandidates() {
  const primary = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  return [...new Set([primary, ...FALLBACK_MODELS])];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(err) {
  const msg = (err?.message || String(err)).toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('resource exhausted')
  );
}

function buildModel(modelName, systemText, options = {}) {
  const genAI = new GoogleGenerativeAI(getGeminiApiKey());
  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemText || undefined,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.max_tokens ?? 2048,
    },
  });
}

function toGeminiHistory(messages) {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || '') }],
    }));
}

async function runOnce(modelName, messages, options) {
  const systemText = messages.find((m) => m.role === 'system')?.content || '';
  const conversation = messages.filter((m) => m.role !== 'system');
  const model = buildModel(modelName, systemText, options);

  if (conversation.length === 1 && conversation[0].role === 'user') {
    const result = await model.generateContent(conversation[0].content);
    const text = result.response.text();
    if (!text?.trim()) throw new Error('Empty response from Gemini');
    return text.trim();
  }

  const last = conversation[conversation.length - 1];
  if (last.role !== 'user') {
    throw new Error('Last message must be from user');
  }

  let history = toGeminiHistory(conversation.slice(0, -1));
  while (history.length && history[0].role !== 'user') {
    history = history.slice(1);
  }

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(last.content);
  const text = result.response.text();
  if (!text?.trim()) throw new Error('Empty response from Gemini');
  return text.trim();
}

async function runWithModelRetries(modelName, messages, options) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await runOnce(modelName, messages, options);
    } catch (err) {
      lastError = err;
      if (isRetryableError(err) && attempt < 2) {
        await sleep(1500 * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

function friendlyError(err, triedModels) {
  const msg = err?.message || String(err);
  if (msg.includes('429') || msg.includes('quota')) {
    return new Error(
      'Gemini quota limit. 1-2 minute wait karo ya Google AI Studio se billing check karo.'
    );
  }
  if (isRetryableError(err)) {
    return new Error(
      `Gemini busy hai (503). 30 sec baad dubara try karo. Models tried: ${triedModels.join(', ')}`
    );
  }
  if (msg.includes('404') && msg.includes('not found')) {
    return new Error(
      `Model not found. backend/.env mein GEMINI_MODEL=gemini-2.5-flash set karo.`
    );
  }
  return new Error(`Gemini API Error: ${msg}`);
}

/**
 * Unified AI — Google Gemini with retries + model fallback.
 */
export async function chatCompletion(messages, options = {}) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      'Gemini API key missing. Set GEMINI_API_KEY in backend/.env (https://aistudio.google.com/apikey)'
    );
  }

  if (!messages.filter((m) => m.role !== 'system').length) {
    throw new Error('No messages to send to AI');
  }

  const models = getModelCandidates();
  let lastError;

  for (const modelName of models) {
    try {
      return await runWithModelRetries(modelName, messages, options);
    } catch (err) {
      lastError = err;
      const retryable = isRetryableError(err);
      const notFound = (err?.message || '').includes('404');
      if (retryable || notFound) {
        console.warn(`Gemini model ${modelName} failed, trying next…`, err.message);
        continue;
      }
      break;
    }
  }

  throw friendlyError(lastError, models);
}
