import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().default('file:./dev.db'),

  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().optional(),

  NVIDIA_API_KEY: z.string().optional(),
  NVIDIA_MODEL: z.string().optional(),

  AI_REQUEST_TIMEOUT_MS: z.string().optional(),
  AI_FALLBACK_ENABLED: z.string().optional(),
});

export const env = envSchema.parse({
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,

  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GROQ_MODEL: process.env.GROQ_MODEL,

  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,
  NVIDIA_MODEL: process.env.NVIDIA_MODEL,

  AI_REQUEST_TIMEOUT_MS: process.env.AI_REQUEST_TIMEOUT_MS,
  AI_FALLBACK_ENABLED: process.env.AI_FALLBACK_ENABLED,
});

export type Env = z.infer<typeof envSchema>;