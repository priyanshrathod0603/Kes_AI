import * as dotenv from 'dotenv';
import * as path from 'path';

// Automatically load backend/.env relative to this script directory
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

import { aiService } from '../src/ai';

async function runAiServiceTest() {
  console.log('====================================================');
  console.log('         AI SERVICE FALLBACK & GENERATION TEST      ');
  console.log('====================================================');
  console.log(`Environment file loaded: ${envPath}`);
  console.log(`Fallback Enabled        : ${process.env.AI_FALLBACK_ENABLED || 'false'}`);
  console.log(`NVIDIA Model            : ${process.env.NVIDIA_MODEL || '(default)'}`);
  console.log(`Groq Model              : ${process.env.GROQ_MODEL || '(default)'}`);
  console.log('----------------------------------------------------');

  try {
    console.log('Testing unified AI generation (NVIDIA primary with Groq fallback)...');
    const startTime = Date.now();

    const response = await aiService.generateAuto({
      userPrompt: 'Respond with "AI Service unified test passed successfully!"',
      temperature: 0.1,
      maxTokens: 50,
    });

    const durationMs = Date.now() - startTime;

    console.log('----------------------------------------------------');
    console.log(`Active Provider Used    : ${response.provider.toUpperCase()}`);
    console.log(`Active Model Used       : ${response.model}`);
    console.log(`Response Time           : ${durationMs}ms`);
    console.log(`Response Content        : "${response.content.trim()}"`);
    if (response.usage) {
      console.log(`Token Usage             : ${JSON.stringify(response.usage)}`);
    }
    console.log('----------------------------------------------------');
    console.log('✓ SUCCESS: AI Service generation completed successfully.');
    process.exit(0);
  } catch (error: any) {
    console.log('----------------------------------------------------');
    console.error(`✗ AI SERVICE ERROR: ${error.message}`);
    process.exit(1);
  }
}

runAiServiceTest();
