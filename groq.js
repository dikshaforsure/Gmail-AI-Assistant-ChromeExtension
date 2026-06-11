import Groq from 'groq-sdk';

export async function getGroqChatCompletion(apiKey, context) {
  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  return groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: context,
      },
    ],
    model: 'openai/gpt-oss-20b',
  });
}