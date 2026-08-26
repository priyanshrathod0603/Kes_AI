/**
 * AI Provider Layer - Common Types
 * Provider-agnostic interfaces for AI text generation
 */

/** Supported AI providers */
export type AIProvider = 'groq' | 'nvidia';

/** Input options for text generation */
export interface AITextGenerationOptions {
  /** System prompt to set the behavior */
  systemPrompt: string;
  /** User prompt/message */
  userPrompt: string;
  /** Model to use (provider-specific) */
  model?: string;
  /** Temperature for randomness (0-2) */
  temperature?: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Optional: override the default timeout for this request */
  timeoutMs?: number;
}

/** Normalized response from any provider */
export interface AIResponse {
  /** Generated text content */
  content: string;
  /** Model used for generation */
  model: string;
  /** Provider that generated the response */
  provider: AIProvider;
  /** Token usage information (if available) */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Raw provider response (for debugging) */
  rawResponse?: unknown;
}

/** Configuration for a provider */
export interface AIProviderConfig {
  apiKey: string;
  defaultModel: string;
  baseUrl: string;
  timeoutMs: number;
}

/** Error codes for AI provider errors */
export enum AIErrorCode {
  MISSING_API_KEY = 'MISSING_API_KEY',
  INVALID_PROVIDER = 'INVALID_PROVIDER',
  PROVIDER_UNAVAILABLE = 'PROVIDER_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/** Custom error class for AI provider errors */
export class AIProviderError extends Error {
  public readonly code: AIErrorCode;
  public readonly provider: AIProvider;
  public readonly statusCode?: number;
  public readonly isRetryable: boolean;

  constructor(
    code: AIErrorCode,
    message: string,
    provider: AIProvider,
    options?: {
      statusCode?: number;
      isRetryable?: boolean;
      cause?: Error;
    }
  ) {
    super(message);
    this.name = 'AIProviderError';
    this.code = code;
    this.provider = provider;
    this.statusCode = options?.statusCode;
    this.isRetryable = options?.isRetryable ?? false;
    if (options?.cause) {
      this.cause = options.cause;
    }
  }

  /** Create error for missing API key */
  static missingApiKey(provider: AIProvider): AIProviderError {
    return new AIProviderError(
      AIErrorCode.MISSING_API_KEY,
      `${provider} API key is not configured`,
      provider,
      { isRetryable: false }
    );
  }

  /** Create error for invalid provider */
  static invalidProvider(provider: string): AIProviderError {
    return new AIProviderError(
      AIErrorCode.INVALID_PROVIDER,
      `Unknown AI provider: ${provider}`,
      provider as AIProvider,
      { isRetryable: false }
    );
  }

  /** Create error for provider unavailable */
  static providerUnavailable(provider: AIProvider, cause?: Error): AIProviderError {
    return new AIProviderError(
      AIErrorCode.PROVIDER_UNAVAILABLE,
      `${provider} provider is unavailable`,
      provider,
      { isRetryable: true, cause }
    );
  }

  /** Create error for timeout */
  static timeout(provider: AIProvider, timeoutMs: number): AIProviderError {
    return new AIProviderError(
      AIErrorCode.TIMEOUT,
      `${provider} request timed out after ${timeoutMs}ms`,
      provider,
      { isRetryable: true }
    );
  }

  /** Create error for rate limit */
  static rateLimit(provider: AIProvider, retryAfter?: number): AIProviderError {
    return new AIProviderError(
      AIErrorCode.RATE_LIMIT,
      `${provider} rate limit exceeded${retryAfter ? `, retry after ${retryAfter}s` : ''}`,
      provider,
      { statusCode: 429, isRetryable: true }
    );
  }

  /** Create error for invalid response */
  static invalidResponse(provider: AIProvider, details?: string): AIProviderError {
    return new AIProviderError(
      AIErrorCode.INVALID_RESPONSE,
      `${provider} returned an invalid response${details ? `: ${details}` : ''}`,
      provider,
      { isRetryable: false }
    );
  }

  /** Create error for network errors */
  static networkError(provider: AIProvider, cause: Error): AIProviderError {
    return new AIProviderError(
      AIErrorCode.NETWORK_ERROR,
      `${provider} network error: ${cause.message}`,
      provider,
      { isRetryable: true, cause }
    );
  }

  /** Create error for authentication errors */
  static authenticationError(provider: AIProvider, cause?: Error): AIProviderError {
    return new AIProviderError(
      AIErrorCode.AUTHENTICATION_ERROR,
      `${provider} authentication failed`,
      provider,
      { statusCode: 401, isRetryable: true, cause }
    );
  }

  /** Create error for unknown errors */
  static unknown(provider: AIProvider, cause: Error): AIProviderError {
    return new AIProviderError(
      AIErrorCode.UNKNOWN_ERROR,
      `${provider} unexpected error: ${cause.message}`,
      provider,
      { isRetryable: false, cause }
    );
  }
}

/** Options for the AI service generate method */
export interface AIGenerateOptions extends AITextGenerationOptions {
  /** Provider to use */
  provider: AIProvider;
  /** Enable fallback to another provider if primary fails */
  enableFallback?: boolean;
  /** Fallback provider to use if primary fails */
  fallbackProvider?: AIProvider;
}
