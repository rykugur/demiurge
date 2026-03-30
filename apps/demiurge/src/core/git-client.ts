import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

export interface GitStatusEntry {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'untracked';
}

export class GitClient {
  private dir: string;

  constructor(dir: string) {
    this.dir = dir;
  }

  async init(): Promise<void> {
    if (!existsSync(this.dir)) {
      mkdirSync(this.dir, { recursive: true });
    }
    
    await git.init({
      fs: require('fs'),
      dir: this.dir,
      defaultBranch: 'main',
    });
  }

  async configureAuthor(name: string, email: string): Promise<void> {
    await git.setConfig({
      fs: require('fs'),
      dir: this.dir,
      path: 'user.name',
      value: name,
    });

    await git.setConfig({
      fs: require('fs'),
      dir: this.dir,
      path: 'user.email',
      value: email,
    });
  }

  async add(filepath: string): Promise<void> {
    await git.add({
      fs: require('fs'),
      dir: this.dir,
      filepath,
    });
  }

  async addAll(): Promise<void> {
    const status = await git.statusMatrix({
      fs: require('fs'),
      dir: this.dir,
    });

    for (const [filepath, , worktreeStatus] of status) {
      if (worktreeStatus !== 1) {
        await this.add(filepath);
      }
    }
  }

  async commit(message: string): Promise<string> {
    const commitHash = await git.commit({
      fs: require('fs'),
      dir: this.dir,
      message,
      author: {
        name: await this.getConfig('user.name') || 'Demiurge',
        email: await this.getConfig('user.email') || 'demiurge@local',
      },
    });

    return commitHash;
  }

  async status(): Promise<GitStatusEntry[]> {
    const statusMatrix = await git.statusMatrix({
      fs: require('fs'),
      dir: this.dir,
    });

    return statusMatrix
      .filter(([_, headStatus, worktreeStatus]) => 
        headStatus !== 1 || worktreeStatus !== 1
      )
      .map(([filepath, headStatus, worktreeStatus]) => {
        let status: GitStatusEntry['status'];
        
        if (headStatus === 0 && worktreeStatus === 2) {
          status = 'added';
        } else if (headStatus === 1 && worktreeStatus === 2) {
          status = 'modified';
        } else if (worktreeStatus === 0) {
          status = 'deleted';
        } else {
          status = 'untracked';
        }

        return { path: filepath, status };
      });
  }

  async createBranch(branchName: string, checkout: boolean = true): Promise<void> {
    await git.branch({
      fs: require('fs'),
      dir: this.dir,
      ref: branchName,
      checkout,
    });
  }

  async checkout(branchName: string): Promise<void> {
    await git.checkout({
      fs: require('fs'),
      dir: this.dir,
      ref: branchName,
    });
  }

  async getCurrentBranch(): Promise<string> {
    const currentBranch = await git.currentBranch({
      fs: require('fs'),
      dir: this.dir,
      fullname: false,
    });

    return currentBranch || 'HEAD';
  }

  async listBranches(): Promise<string[]> {
    const branches = await git.listBranches({
      fs: require('fs'),
      dir: this.dir,
    });

    return branches;
  }

  async clone(url: string, branch: string = 'main'): Promise<void> {
    await git.clone({
      fs: require('fs'),
      http,
      dir: this.dir,
      url,
      ref: branch,
      singleBranch: true,
      depth: 10,
    });
  }

  async push(remote: string = 'origin', branch?: string): Promise<void> {
    const branchToPush = branch || await this.getCurrentBranch();
    const token = process.env.DEMIURGE_GITHUB_TOKEN;
    
    if (!token) {
      throw new Error('DEMIURGE_GITHUB_TOKEN not set');
    }

    // Extract owner/repo from remote URL
    const remoteUrl = await this.getRemoteUrl(remote);
    const authUrl = remoteUrl.replace('https://', `https://${token}@`);

    await git.push({
      fs: require('fs'),
      http,
      dir: this.dir,
      remote: authUrl,
      ref: branchToPush,
      onAuth: () => ({ username: token, password: 'x-oauth-basic' }),
    });
  }

  async pull(remote: string = 'origin', branch?: string): Promise<void> {
    const branchToPull = branch || await this.getCurrentBranch();
    const token = process.env.DEMIURGE_GITHUB_TOKEN;
    
    if (!token) {
      throw new Error('DEMIURGE_GITHUB_TOKEN not set');
    }

    const remoteUrl = await this.getRemoteUrl(remote);
    const authUrl = remoteUrl.replace('https://', `https://${token}@`);

    await git.pull({
      fs: require('fs'),
      http,
      dir: this.dir,
      remote: authUrl,
      ref: branchToPull,
      singleBranch: true,
      onAuth: () => ({ username: token, password: 'x-oauth-basic' }),
    });
  }

  async getRemoteUrl(remote: string = 'origin'): Promise<string> {
    const remotes = await git.listRemotes({
      fs: require('fs'),
      dir: this.dir,
    });

    const foundRemote = remotes.find(r => r.remote === remote);
    if (!foundRemote) {
      throw new Error(`Remote '${remote}' not found`);
    }

    return foundRemote.url;
  }

  async addRemote(name: string, url: string): Promise<void> {
    await git.addRemote({
      fs: require('fs'),
      dir: this.dir,
      remote: name,
      url,
    });
  }

  private async getConfig(key: string): Promise<string | undefined> {
    try {
      return await git.getConfig({
        fs: require('fs'),
        dir: this.dir,
        path: key,
      });
    } catch {
      return undefined;
    }
  }

  getRepositoryPath(): string {
    return this.dir;
  }
}
