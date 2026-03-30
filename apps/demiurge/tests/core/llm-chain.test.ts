import { describe, it, expect, beforeEach } from 'bun:test';
import { LLMChain, MockProvider } from '@/core/llm-chain';
import type { LLMProvider } from '@/core/types';

describe('LLMChain', () => {
  it('should use first available provider', async () => {
    const primary = new MockProvider('primary', 1, true);
    const secondary = new MockProvider('secondary', 2, true);
    
    const chain = new LLMChain([primary, secondary]);
    const response = await chain.generate('Hello');
    
    expect(response.provider).toBe('primary');
    expect(response.content).toContain('primary');
    expect(primary.callCount).toBe(1);
    expect(secondary.callCount).toBe(0);
  });

  it('should failover to secondary when primary fails', async () => {
    const primary = new MockProvider('primary', 1, false);
    const secondary = new MockProvider('secondary', 2, true);
    
    const chain = new LLMChain([primary, secondary]);
    const response = await chain.generate('Hello');
    
    expect(response.provider).toBe('secondary');
    expect(primary.callCount).toBe(1);
    expect(secondary.callCount).toBe(1);
  });

  it('should throw when all providers fail', async () => {
    const primary = new MockProvider('primary', 1, false);
    const secondary = new MockProvider('secondary', 2, false);
    
    const chain = new LLMChain([primary, secondary]);
    
    await expect(chain.generate('Hello')).rejects.toThrow('All LLM providers failed');
  });

  it('should select provider by tier', async () => {
    const cheap = new MockProvider('cheap', 1, true);
    const expensive = new MockProvider('expensive', 3, true);
    
    const chain = new LLMChain([cheap, expensive]);
    const response = await chain.generate('Hello', undefined, 1);
    
    expect(response.provider).toBe('cheap');
  });
});
