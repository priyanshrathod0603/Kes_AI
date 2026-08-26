/**
 * AI Service - Central orchestration for AI providers
 *
 * Provider Priority:
 *   1. NVIDIA - Primary
 *   2. Groq   - Fallback
 *
 * Automatic flow:
 *   NVIDIA → if retryable failure → Groq
 */

import { env } from '../config/env';
import { GroqProvider } from './providers/groq.provider';
import { NvidiaProvider } from './providers/nvidia.provider';

import {
  AIProvider,
  AITextGenerationOptions,
  AIResponse,
  AIGenerateOptions,
  AIProviderError,
  AIErrorCode,
} from './ai.types';

export class AIService {
  private readonly groqProvider: GroqProvider;
  private readonly nvidiaProvider: NvidiaProvider;
  private readonly fallbackEnabled: boolean;

  constructor() {
    this.groqProvider = new GroqProvider();
    this.nvidiaProvider = new NvidiaProvider();

    this.fallbackEnabled =
      env.AI_FALLBACK_ENABLED === 'true';
  }

  /**
   * Get provider instance by provider name.
   */
  private getProvider(provider: AIProvider) {
    switch (provider) {
      case 'nvidia':
        return this.nvidiaProvider;

      case 'groq':
        return this.groqProvider;

      default:
        throw AIProviderError.invalidProvider(provider);
    }
  }

  /**
   * Check whether a provider is configured.
   */
  isProviderConfigured(provider: AIProvider): boolean {
    return this.getProvider(provider).isConfigured();
  }

  /**
   * Get default model for a provider.
   */
  getDefaultModel(provider: AIProvider): string {
    return this.getProvider(provider).getDefaultModel();
  }

  /**
   * Get all configured providers.
   *
   * IMPORTANT:
   * NVIDIA is intentionally first because
   * NVIDIA is our primary provider.
   */
  getConfiguredProviders(): AIProvider[] {
    const providers: AIProvider[] = [];

    // Primary provider
    if (this.nvidiaProvider.isConfigured()) {
      providers.push('nvidia');
    }

    // Fallback provider
    if (this.groqProvider.isConfigured()) {
      providers.push('groq');
    }

    return providers;
  }

  /**
   * Generate text using a specific provider.
   *
   * Fallback behavior:
   *
   * NVIDIA → Groq
   * Groq   → NVIDIA (only if explicitly requested as fallback)
   */
  async generate(
    options: AIGenerateOptions
  ): Promise<AIResponse> {
    const {
      provider,
      enableFallback,
      fallbackProvider,
      ...generationOptions
    } = options;

    // Get primary provider
    const primaryProvider = this.getProvider(provider);

    // Make sure primary provider has API key
    if (!primaryProvider.isConfigured()) {
      throw AIProviderError.missingApiKey(provider);
    }

    try {
      /**
       * Try primary provider first.
       */
      return await primaryProvider.generateText(
        generationOptions
      );
    } catch (primaryError) {
      /**
       * Only fallback for retryable AI errors.
       */
      const shouldFallback =
        this.fallbackEnabled &&
        enableFallback !== false &&
        primaryError instanceof AIProviderError &&
        primaryError.isRetryable &&
        !!fallbackProvider &&
        fallbackProvider !== provider &&
        this.isProviderConfigured(fallbackProvider);

      if (!shouldFallback) {
        throw primaryError;
      }

      console.warn(
        `[AI Service] ${provider} failed ` +
          `(${primaryError.code}). ` +
          `Falling back to ${fallbackProvider}.`
      );

      try {
        /**
         * Try fallback provider.
         */
        const fallbackInstance =
          this.getProvider(fallbackProvider);

        return await fallbackInstance.generateText(
          generationOptions
        );
      } catch (fallbackError) {
        /**
         * Both providers failed.
         */
        if (fallbackError instanceof AIProviderError) {
          throw new AIProviderError(
            AIErrorCode.PROVIDER_UNAVAILABLE,
            `Both AI providers failed. ` +
              `Primary (${provider}): ${primaryError.message}. ` +
              `Fallback (${fallbackProvider}): ${fallbackError.message}`,
            provider,
            {
              isRetryable: false,
              cause: primaryError,
            }
          );
        }

        throw primaryError;
      }
    }
  }

  /**
   * Automatically select the AI provider.
   *
   * Priority:
   *
   *   NVIDIA
   *      ↓
   *   Groq
   *
   * If NVIDIA is configured:
   *   NVIDIA becomes primary.
   *
   * If NVIDIA fails with a retryable error:
   *   Groq becomes fallback.
   *
   * If NVIDIA is not configured:
   *   Groq becomes primary.
   */
  async generateAuto(
    options: AITextGenerationOptions
  ): Promise<AIResponse> {
    const configuredProviders =
      this.getConfiguredProviders();

    /**
     * No providers configured.
     */
    if (configuredProviders.length === 0) {
      throw AIProviderError.missingApiKey('nvidia');
    }

    /**
     * NVIDIA has highest priority.
     */
    const primaryProvider: AIProvider =
      configuredProviders.includes('nvidia')
        ? 'nvidia'
        : 'groq';

    /**
     * Groq is NVIDIA's fallback.
     */
    const fallbackProvider: AIProvider | undefined =
      primaryProvider === 'nvidia' &&
      configuredProviders.includes('groq')
        ? 'groq'
        : undefined;

    return this.generate({
      provider: primaryProvider,

      enableFallback:
        this.fallbackEnabled &&
        !!fallbackProvider,

      fallbackProvider,

      ...options,
    });
  }

  /**
   * Simple text generation helper.
   *
   * If provider is specified:
   *   Use that provider directly.
   *
   * If provider is not specified:
   *   NVIDIA → Groq
   */
  async generateSimple(
    systemPrompt: string,
    userPrompt: string,
    provider?: AIProvider
  ): Promise<string> {
    const options: AITextGenerationOptions = {
      systemPrompt,
      userPrompt,
    };

    /**
     * Explicit provider selected.
     */
    if (provider) {
      const response = await this.generate({
        provider,
        ...options,
      });

      return response.content;
    }

    /**
     * Automatic provider selection.
     *
     * NVIDIA → Groq
     */
    const response =
      await this.generateAuto(options);

    return response.content;
  }
}

/**
 * Singleton AI service.
 *
 * Import this anywhere:
 *
 * import { aiService } from '../ai/ai.service';
 */
export const aiService = new AIService();