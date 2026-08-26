import { env } from '../../config/env';
import {
  AIProvider,
  AIResponse,
  AITextGenerationOptions,
  AIProviderConfig,
  AIProviderError,
} from '../ai.types';

interface NvidiaMessage {
  role: 'system' | 'user';
  content: string;
}

interface NvidiaRequestBody {
  model: string;
  messages: NvidiaMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface NvidiaResponse {
  id?: string;
  model?: string;
  choices?: Array<{
    index: number;
    message?: {
      role: string;
      content?: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export class NvidiaProvider {
  public readonly provider: AIProvider = 'nvidia';

  private readonly config: AIProviderConfig;

  constructor() {
    this.config = {
      apiKey: env.NVIDIA_API_KEY || '',
      defaultModel:
        env.NVIDIA_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b',
      baseUrl: 'https://integrate.api.nvidia.com/v1',
      timeoutMs: Number(env.AI_REQUEST_TIMEOUT_MS || 30000),
    };
  }

  isConfigured(): boolean {
    return Boolean(this.config.apiKey);
  }

  getDefaultModel(): string {
    return this.config.defaultModel;
  }

  async generateText(
    options: AITextGenerationOptions
  ): Promise<AIResponse> {
    if (!this.isConfigured()) {
      throw AIProviderError.missingApiKey(this.provider);
    }

    const model = options.model || this.config.defaultModel;

    const messages: NvidiaMessage[] = [];

    if (options.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: options.userPrompt,
    });

    const requestBody: NvidiaRequestBody = {
      model,
      messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 1000,
    };

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, options.timeoutMs || this.config.timeoutMs);

    try {
      const response = await fetch(
        `${this.config.baseUrl}/chat/completions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }
      );

      if (response.status === 401) {
        throw AIProviderError.authenticationError(this.provider);
      }

      if (response.status === 429) {
        throw AIProviderError.rateLimit(this.provider);
      }

      if (!response.ok) {
        const errorText = await response.text();

        throw AIProviderError.providerUnavailable(
          this.provider,
          new Error(
            `HTTP ${response.status}: ${errorText}`
          )
        );
      }

      const data = (await response.json()) as NvidiaResponse;

      return this.normalizeResponse(data, model);
    } catch (error) {
      if (error instanceof AIProviderError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw AIProviderError.timeout(
          this.provider,
          options.timeoutMs || this.config.timeoutMs
        );
      }

      if (error instanceof Error) {
        throw AIProviderError.networkError(
          this.provider,
          error
        );
      }

      throw AIProviderError.unknown(
        this.provider,
        new Error(String(error))
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private normalizeResponse(
    data: NvidiaResponse,
    model: string
  ): AIResponse {
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw AIProviderError.invalidResponse(
        this.provider,
        'Missing response content'
      );
    }

    return {
      content,
      model: data.model || model,
      provider: this.provider,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens || 0,
            completionTokens:
              data.usage.completion_tokens || 0,
            totalTokens: data.usage.total_tokens || 0,
          }
        : undefined,
      rawResponse: data,
    };
  }
}
