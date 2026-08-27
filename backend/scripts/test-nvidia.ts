import * as dotenv from 'dotenv';
import * as path from 'path';

// Automatically load backend/.env relative to this script directory
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

async function runNvidiaTest() {
  const apiKey = process.env.NVIDIA_API_KEY;
  const configuredModel = process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-super-120b-a12b';
  const timeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS || 30000);

  console.log('====================================================');
  console.log('         NVIDIA NIM API CONNECTION TEST             ');
  console.log('====================================================');
  console.log(`Environment file loaded: ${envPath}`);
  console.log(`Configured Model        : ${configuredModel}`);
  console.log(`API Endpoint            : https://integrate.api.nvidia.com/v1/chat/completions`);
  console.log(`API Key Configured      : ${apiKey ? 'YES (Key detected in environment)' : 'NO (Missing or empty)'}`);
  console.log('----------------------------------------------------');

  if (!apiKey || apiKey.trim() === '') {
    console.error('✗ ERROR: NVIDIA_API_KEY is not configured in backend/.env.');
    console.error('Please set NVIDIA_API_KEY in backend/.env and re-run.');
    process.exit(1);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log('Sending test request to NVIDIA NIM...');
    const startTime = Date.now();

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
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
            content: 'Hello! Respond with a single concise sentence confirming NVIDIA NIM connection.',
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
      console.log('✓ SUCCESS: NVIDIA NIM API is responding correctly.');
      process.exit(0);
    } else if (response.status === 401) {
      let errDetail = '';
      try {
        const errJson: any = await response.json();
        errDetail = errJson.message || errJson.detail || JSON.stringify(errJson);
      } catch {
        errDetail = await response.text();
      }
      console.log('----------------------------------------------------');
      console.error(`✗ AUTHENTICATION ERROR (HTTP 401): NVIDIA API authentication failed.`);
      console.error(`Reason: ${errDetail || 'Invalid or expired NVIDIA_API_KEY in backend/.env'}`);
      console.error('Please check your NVIDIA_API_KEY in backend/.env.');
      process.exit(1);
    } else if (response.status === 429) {
      console.log('----------------------------------------------------');
      console.error(`✗ RATE LIMIT EXCEEDED (HTTP 429): NVIDIA NIM rate limit or credit quota reached.`);
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
      console.error(`✗ NETWORK ERROR: Unable to reach NVIDIA API: ${error.message}`);
    }
    process.exit(1);
  }
}

runNvidiaTest();
