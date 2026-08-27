import * as dotenv from 'dotenv';
import * as path from 'path';

// Automatically load backend/.env relative to this script directory
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

async function runGroqTest() {
  const apiKey = process.env.GROQ_API_KEY;
  const configuredModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const timeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS || 30000);

  console.log('====================================================');
  console.log('           GROQ API CONNECTION TEST                 ');
  console.log('====================================================');
  console.log(`Environment file loaded: ${envPath}`);
  console.log(`Configured Model        : ${configuredModel}`);
  console.log(`API Endpoint            : https://api.groq.com/openai/v1/chat/completions`);
  console.log(`API Key Configured      : ${apiKey ? 'YES (Key detected in environment)' : 'NO (Missing or empty)'}`);
  console.log('----------------------------------------------------');

  if (!apiKey || apiKey.trim() === '') {
    console.error('✗ ERROR: GROQ_API_KEY is not configured in backend/.env.');
    console.error('Please set GROQ_API_KEY in backend/.env and re-run.');
    process.exit(1);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log('Sending test request to Groq...');
    const startTime = Date.now();

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: configuredModel,
        messages: [
          {
            role: 'user',
            content: 'Hello! Respond with a single concise sentence confirming Groq connection.',
          },
        ],
        temperature: 0.2,
        max_tokens: 100,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);
    const durationMs = Date.now() - startTime;

    console.log(`HTTP Status             : ${response.status} ${response.statusText} (${durationMs}ms)`);

    if (response.status === 200) {
      const data: any = await response.json();
      const replyContent = data.choices?.[0]?.message?.content?.trim() || '(No content returned)';
      console.log('----------------------------------------------------');
      console.log(`Provider Response       : "${replyContent}"`);
      if (data.usage) {
        console.log(`Usage Metrics           : prompt_tokens=${data.usage.prompt_tokens}, completion_tokens=${data.usage.completion_tokens}, total_tokens=${data.usage.total_tokens}`);
      }
      console.log('----------------------------------------------------');
      console.log('✓ SUCCESS: Groq API is responding correctly.');
      process.exit(0);
    } else if (response.status === 401) {
      console.log('----------------------------------------------------');
      console.error(`✗ AUTHENTICATION ERROR (HTTP 401): Groq API authentication failed.`);
      console.error('Please check your GROQ_API_KEY in backend/.env.');
      process.exit(1);
    } else if (response.status === 429) {
      console.log('----------------------------------------------------');
      console.error(`✗ RATE LIMIT EXCEEDED (HTTP 429): Groq API rate limit or quota reached.`);
      process.exit(1);
    } else {
      const errorText = await response.text();
      console.log('----------------------------------------------------');
      console.error(`✗ PROVIDER ERROR (HTTP ${response.status}): ${errorText}`);
      process.exit(1);
    }
  } catch (error: any) {
    clearTimeout(timer);
    console.log('----------------------------------------------------');
    if (error.name === 'AbortError') {
      console.error(`✗ TIMEOUT ERROR: Request timed out after ${timeoutMs}ms.`);
    } else {
      console.error(`✗ NETWORK ERROR: Unable to reach Groq API: ${error.message}`);
    }
    process.exit(1);
  }
}

runGroqTest();
