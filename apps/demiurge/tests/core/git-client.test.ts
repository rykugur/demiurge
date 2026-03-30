import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { GitClient } from '@/core/git-client';
import { mkdtempSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('GitClient', () => {
  let repoPath: string;
  let client: GitClient;

  beforeEach(async () => {
    repoPath = mkdtempSync(join(tmpdir(), 'git-test-'));
    client = new GitClient(repoPath);
    
    // Initialize git repo
    await client.init();
    await client.configureAuthor('Test User', 'test@example.com');
  });

  afterEach(() => {
    if (existsSync(repoPath)) {
      rmSync(repoPath, { recursive: true });
    }
  });

  it('should initialize a repository', async () => {
    expect(existsSync(join(repoPath, '.git'))).toBe(true);
  });

  it('should stage and commit files', async () => {
    const testFile = join(repoPath, 'test.txt');
    writeFileSync(testFile, 'Hello World');
    
    await client.add('test.txt');
    const commitHash = await client.commit('Initial commit');
    
    expect(commitHash).toBeDefined();
    expect(typeof commitHash).toBe('string');
  });

  it('should get repository status', async () => {
    const testFile = join(repoPath, 'test.txt');
    writeFileSync(testFile, 'Hello World');
    
    const status = await client.status();
    expect(status.length).toBeGreaterThan(0);
    expect(status[0].path).toBe('test.txt');
  });

  it('should create and switch branches', async () => {
    // Create initial commit first
    const testFile = join(repoPath, 'initial.txt');
    writeFileSync(testFile, 'Initial');
    await client.add('initial.txt');
    await client.commit('Initial commit');
    
    await client.createBranch('feature-branch');
    const currentBranch = await client.getCurrentBranch();
    
    expect(currentBranch).toBe('feature-branch');
  });
});
