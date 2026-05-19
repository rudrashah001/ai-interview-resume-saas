import OpenAI from 'openai';

let client = null;

export const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
};

export async function chatCompletion(messages, options = {}) {
  const openai = getOpenAI();
  if (!openai) {
    throw new Error('OpenAI is not configured');
  }
  const model = options.model || 'gpt-4o-mini';
  const completion = await openai.chat.completions.create({
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 1024,
  });
  return completion.choices[0]?.message?.content?.trim() || '';
}
