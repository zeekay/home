/**
 * Hanzo AI Gateway Service
 *
 * Provides integration with the Hanzo Gateway for AI inference:
 * - Multi-provider routing (DeepSeek, OpenAI, Anthropic, local)
 * - Rate limiting with free tier support
 * - Streaming chat completions
 * - Model discovery
 */

import { logger } from '@/lib/logger';

// Types
export interface HanzoGatewayConfig {
  baseUrl: string;
  identity?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  top_p?: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }[];
}

export interface Model {
  id: string;
  provider: string;
  pricing: string;
}

export interface RateLimitStatus {
  ip: string;
  limits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
    tokensPerDay: number;
  };
  usage: {
    minuteCount: number;
    hourCount: number;
    dayCount: number;
    tokensToday: number;
  };
  stats: {
    totalRequests: number;
    totalTokens: number;
  };
}

export interface HealthStatus {
  status: string;
  identity: string;
  providers: string[];
  limits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
    tokensPerDay: number;
  };
  cloudflare: boolean;
  timestamp: string;
}

// Default config - use local gateway or production
const DEFAULT_CONFIG: HanzoGatewayConfig = {
  baseUrl: 'http://localhost:3001', // Local gateway
  // baseUrl: 'https://gateway.hanzo.ai', // Production
};

// Fallback gateway URLs to try in order
const GATEWAY_URLS = [
  'http://localhost:3001',
  'http://localhost:9550',
  'https://gateway.hanzo.ai',
];

class HanzoGatewayService {
  private config: HanzoGatewayConfig;
  private activeUrl: string | null = null;

  constructor(config?: Partial<HanzoGatewayConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Update service configuration
   */
  setConfig(config: Partial<HanzoGatewayConfig>): void {
    this.config = { ...this.config, ...config };
    this.activeUrl = null; // Reset active URL to force re-discovery
  }

  /**
   * Get current configuration
   */
  getConfig(): HanzoGatewayConfig {
    return { ...this.config };
  }

  /**
   * Find a working gateway URL
   */
  private async findWorkingGateway(): Promise<string | null> {
    if (this.activeUrl) {
      // Verify current URL still works
      try {
        const response = await fetch(`${this.activeUrl}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000),
        });
        if (response.ok) return this.activeUrl;
      } catch {
        this.activeUrl = null;
      }
    }

    // Try configured URL first
    const urls = [this.config.baseUrl, ...GATEWAY_URLS.filter(u => u !== this.config.baseUrl)];

    for (const url of urls) {
      try {
        const response = await fetch(`${url}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000),
        });
        if (response.ok) {
          this.activeUrl = url;
          logger.info(`Hanzo Gateway connected: ${url}`);
          return url;
        }
      } catch {
        // Try next URL
      }
    }

    return null;
  }

  /**
   * Get the base URL (with auto-discovery)
   */
  private async getBaseUrl(): Promise<string> {
    const url = await this.findWorkingGateway();
    if (!url) {
      throw new Error('No Hanzo Gateway available. Please ensure the gateway is running.');
    }
    return url;
  }

  /**
   * Health check - verify gateway is running
   */
  async healthCheck(): Promise<HealthStatus | null> {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      logger.error('Hanzo Gateway health check failed:', error);
      return null;
    }
  }

  /**
   * Check if gateway is available
   */
  async isAvailable(): Promise<boolean> {
    const url = await this.findWorkingGateway();
    return url !== null;
  }

  /**
   * Get available models
   */
  async getModels(): Promise<Model[]> {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await fetch(`${baseUrl}/v1/models`, {
        method: 'GET',
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      logger.error('Failed to get models:', error);
      return [];
    }
  }

  /**
   * Get rate limit status
   */
  async getRateLimitStatus(): Promise<RateLimitStatus | null> {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await fetch(`${baseUrl}/v1/rate-limit-status`, {
        method: 'GET',
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      logger.error('Failed to get rate limit status:', error);
      return null;
    }
  }

  /**
   * Send a chat completion request (non-streaming)
   */
  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Gateway error: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Send a streaming chat completion request
   */
  async *chatCompletionStream(
    request: ChatCompletionRequest,
    signal?: AbortSignal
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const baseUrl = await this.getBaseUrl();
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Gateway error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') return;

          try {
            const chunk: StreamChunk = JSON.parse(data);
            yield chunk;
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  /**
   * Simple chat helper - send a single message and get response
   */
  async chat(
    userMessage: string,
    options?: {
      model?: string;
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const messages: ChatMessage[] = [];

    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: userMessage });

    const response = await this.chatCompletion({
      model: options?.model || 'deepseek-chat',
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Streaming chat helper - send a message and stream response
   */
  async *chatStream(
    userMessage: string,
    options?: {
      model?: string;
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
      signal?: AbortSignal;
    }
  ): AsyncGenerator<string, void, unknown> {
    const messages: ChatMessage[] = [];

    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: userMessage });

    for await (const chunk of this.chatCompletionStream(
      {
        model: options?.model || 'deepseek-chat',
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
        stream: true,
      },
      options?.signal
    )) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) yield content;
    }
  }
}

// Export singleton instance
export const hanzoGateway = new HanzoGatewayService();

// Export class for custom instances
export { HanzoGatewayService };

// Default system prompt for Hanzo AI
export const HANZO_SYSTEM_PROMPT = `You are Hanzo AI, a helpful, intelligent assistant built by Hanzo AI Inc.

You are running inside zOS, a web-based operating system. You have access to the following capabilities:
- Code generation and explanation
- File manipulation (when integrated with the system)
- Application development assistance
- System automation suggestions

When writing code:
- Use proper markdown formatting with language-specific syntax highlighting
- Provide clear explanations
- Consider best practices and security

Be helpful, concise, and accurate. If you're unsure about something, say so.`;

// Dev Mode system prompt for coding assistance
export const HANZO_DEV_SYSTEM_PROMPT = `You are Hanzo Dev, an expert AI coding assistant powered by @hanzo/dev.

You are running inside zOS, a web-based operating system with an integrated development environment.

## Your Capabilities
- Full-stack application development (React, Vue, Svelte, Node.js, Python, Go, Rust)
- Code generation, debugging, and refactoring
- Architecture design and best practices guidance
- Testing strategies and implementation
- Performance optimization
- Security review and hardening

## Coding Standards
- Write clean, production-ready code
- Follow language-specific conventions and best practices
- Include proper error handling
- Add meaningful comments only where logic is complex
- Use TypeScript/strong typing when applicable
- Consider security implications (OWASP Top 10)

## Response Format
When writing code:
1. Start with a brief explanation of the approach
2. Provide complete, runnable code in markdown code blocks
3. Use proper syntax highlighting (\`\`\`typescript, \`\`\`python, etc.)
4. Include example usage when helpful
5. Note any dependencies or setup required

## Commands
Users can use these commands:
- \`/plan\` - Create an implementation plan
- \`/code\` - Generate code for a specific task
- \`/debug\` - Help debug an issue
- \`/review\` - Review code for improvements
- \`/test\` - Generate tests for code
- \`/explain\` - Explain how code works

You are direct, technically precise, and focused on delivering working solutions. When there's ambiguity, ask clarifying questions. When there are multiple valid approaches, explain the tradeoffs.`;
