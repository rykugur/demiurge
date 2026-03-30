import type { LLMProvider } from '@/core/types';

export interface LLMResponse {
  content: string;
  provider: string;
  tier: number;
}

export class LLMChain {
  private providers: LLMProvider[];

  constructor(providers: LLMProvider[]) {
    this.providers = [...providers].sort((a, b) => a.tier - b.tier);
  }

  async generate(prompt: string, systemPrompt?: string, maxTier?: number): Promise<LLMResponse> {
    const eligibleProviders = maxTier 
      ? this.providers.filter(p => p.tier <= maxTier)
      : this.providers;

    const errors: Array<{ provider: string; error: Error }> = [];

    for (const provider of eligibleProviders) {
      try {
        const content = await provider.generate(prompt, systemPrompt);
        return {
          content,
          provider: provider.name,
          tier: provider.tier,
        };
      } catch (error) {
        errors.push({ 
          provider: provider.name, 
          error: error instanceof Error ? error : new Error(String(error))
        });
      }
    }

    const errorMessage = errors
      .map(e => `${e.provider}: ${e.error.message}`)
      .join('; ');
    
    throw new Error(`All LLM providers failed. Errors: ${errorMessage}`);
  }

  addProvider(provider: LLMProvider): void {
    this.providers.push(provider);
    this.providers.sort((a, b) => a.tier - b.tier);
  }

  getProviders(): LLMProvider[] {
    return [...this.providers];
  }
}

// Mock provider for testing
export class MockProvider implements LLMProvider {
  name: string;
  tier: number;
  private available: boolean;
  callCount = 0;

  constructor(name: string, tier: number, available: boolean = true) {
    this.name = name;
    this.tier = tier;
    this.available = available;
  }

  async isAvailable(): Promise<boolean> {
    return this.available;
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    this.callCount++;
    if (!this.available) {
      throw new Error(`Provider ${this.name} is not available`);
    }
    return `Response from ${this.name} for: ${prompt.substring(0, 20)}...`;
  }
}

// Real provider implementations (placeholders for future tasks)
export class OpenCodeProvider implements LLMProvider {
  name = 'opencode';
  tier = 2;
  
  constructor(private apiKey: string, private baseUrl: string) {}

  async isAvailable(): Promise<boolean> {
    // TODO: Implement health check
    return !!this.apiKey;
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    // TODO: Implement actual API call
    throw new Error('OpenCode provider not yet implemented');
  }
}

export class OpenRouterProvider implements LLMProvider {
  name = 'openrouter';
  tier = 1;
  
  constructor(private apiKey: string, private baseUrl: string) {}

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    throw new Error('OpenRouter provider not yet implemented');
  }
}

export class AnthropicProvider implements LLMProvider {
  name = 'anthropic';
  tier = 3;
  
  constructor(private apiKey: string, private baseUrl: string) {}

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    throw new Error('Anthropic provider not yet implemented');
  }
}

export class OllamaProvider implements LLMProvider {
  name = 'ollama';
  tier = 4;
  
  constructor(private baseUrl: string, private enabled: boolean) {}

  async isAvailable(): Promise<boolean> {
    if (!this.enabled) return false;
    // TODO: Check if Ollama is reachable
    return true;
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    throw new Error('Ollama provider not yet implemented');
  }
}
