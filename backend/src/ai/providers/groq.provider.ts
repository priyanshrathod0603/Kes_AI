/**
 * Groq AI Provider Implementation
 * Uses the official Groq HTTP API
 */

import { env } from '../../config/env';
import {
  AIProvider,
  AIProviderConfig,
  AITextGenerationOptions,
  AIResponse,
  AIProviderError,
  AIErrorCode,
} from '../ai.types';

/** Groq API message format */
interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Groq API request body */
interface GroqRequestBody {
  messages: GroqMessage[];
  model: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

/** Groq API response format */
interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/** Groq error response format */
interface GroqErrorResponse {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}

export class GroqProvider {
  public readonly provider: AIProvider = 'groq';
  private readonly config: AIProviderConfig;

  constructor() {
    this.config = {
      apiKey: env.GROQ_API_KEY || '',
      defaultModel: env.GROQ_MODEL || 'llama-3.1-8b-instant',
      baseUrl: 'https://api.groq.com/openai/v1',
      timeoutMs: Number(env.AI_REQUEST_TIMEOUT_MS) || 30000,
    };
  }

  /** Check if provider is configured */
  isConfigured(): boolean {
    return Boolean(this.config.apiKey);
  }

  /** Get the default model for this provider */
  getDefaultModel(): string {
    return this.config.defaultModel;
  }

  /**
   * Generate text using Groq API
   * @param options - Text generation options
   * @returns Normalized AI response
   */
  async generateText(options: AITextGenerationOptions): Promise<AIResponse> {
    if (!this.isConfigured()) {
      throw AIProviderError.missingApiKey(this.provider);
    }

    const model = options.model || this.config.defaultModel;
    const timeoutMs = options.timeoutMs || this.config.timeoutMs;

    const requestBody: GroqRequestBody = {
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: options.userPrompt },
      ],
      model,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      stream: false,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = (await response.json()) as GroqResponse;

      return this.normalizeResponse(data, model);
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleError(error);
    }
  }

  /** Handle non-OK HTTP responses */
  private async handleErrorResponse(response: Response): Promise<never> {
    const statusCode = response.status;
    let errorMessage = `HTTP ${statusCode}`;

    try {
      const errorData = (await response.json()) as GroqErrorResponse;
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      // Ignore JSON parse errors, use default message
    }

    switch (statusCode) {
      case 401:
        throw AIProviderError.authenticationError(this.provider);
      case 429:
        throw AIProviderError.rateLimit(this.provider);
      case 500:
      case 502:
      case 503:
      case 504:
        throw AIProviderError.providerUnavailable(this.provider);
      default:
        throw new AIProviderError(
          AIErrorCode.INVALID_RESPONSE,
          `Groq API error: ${errorMessage}`,
          this.provider,
          { statusCode, isRetryable: statusCode >= 500 }
        );
    }
  }

  /** Normalize Groq response to internal format */
  private normalizeResponse(data: GroqResponse, model: string): AIResponse {
    const choice = data.choices?.[0];
    if (!choice?.message?.content) {
      throw AIProviderError.invalidResponse(this.provider, 'No content in response');
    }

    return {
      content: choice.message.content,
      model: data.model || model,
      provider: this.provider,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      rawResponse: data,
    };
  }

  /** Handle fetch errors and convert to AIProviderError */
  private handleError(error: unknown): AIProviderError {
    if (error instanceof AIProviderError) {
      return error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      return AIProviderError.timeout(this.provider, this.config.timeoutMs);
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return AIProviderError.networkError(this.provider, error);
    }

    if (error instanceof Error) {
      return AIProviderError.unknown(this.provider, error);
    }

    return AIProviderError.unknown(this.provider, new Error(String(error)));
  }
}