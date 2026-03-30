import { describe, it, expect, beforeEach } from 'bun:test';
import { loadConfig, getConfig, ConfigSchema, clearConfigCache } from '@/core/config';

describe('Config', () => {
  beforeEach(() => {
    // Clear environment and cache
    delete process.env.DEMIURGE_GITHUB_TOKEN;
    delete process.env.DEMIURGE_OPENCODE_API_KEY;
    clearConfigCache();
  });

  it('should load config from environment variables', () => {
    process.env.DEMIURGE_GITHUB_TOKEN = 'test-github-token';
    process.env.DEMIURGE_OPENCODE_API_KEY = 'test-opencode-key';
    process.env.DEMIURGE_REPO_URL = 'https://github.com/test/repo';
    
    const config = loadConfig();
    
    expect(config.github.token).toBe('test-github-token');
    expect(config.llm.opencode.apiKey).toBe('test-opencode-key');
    expect(config.git.repoUrl).toBe('https://github.com/test/repo');
  });

  it('should use defaults for optional values', () => {
    process.env.DEMIURGE_GITHUB_TOKEN = 'test-token';
    
    const config = loadConfig();
    
    expect(config.server.loopIntervalMs).toBe(30000);
    expect(config.server.port).toBe(3000);
  });

  it('should throw on missing required config', () => {
    expect(() => loadConfig()).toThrow();
  });
});
