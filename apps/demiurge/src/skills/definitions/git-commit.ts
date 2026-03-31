import { add, commit } from 'isomorphic-git';
import * as fs from 'fs';
import type { Skill, SkillContext, SkillResult } from '@/skills/types';

export class GitCommitSkill implements Skill {
  definition = {
    id: 'git-commit',
    name: 'Git Commit',
    description: 'Stages files and creates a git commit with a message',
    parameters: [
      {
        name: 'message',
        type: 'string' as const,
        description: 'Commit message',
        required: true,
      },
      {
        name: 'files',
        type: 'array' as const,
        description: 'Array of file paths to stage (default: all changes)',
        required: false,
        default: [],
      },
      {
        name: 'author',
        type: 'object' as const,
        description: 'Author information { name, email }',
        required: false,
      },
    ],
    returns: {
      type: 'object',
      description: 'Commit result with SHA and summary',
    },
    readonly: false,
    category: 'git',
  };

  async execute(
    params: Record<string, unknown>,
    context: SkillContext
  ): Promise<SkillResult> {
    const message = params.message as string;
    const files = (params.files as string[]) || [];
    const author = params.author as { name: string; email: string } | undefined;

    const repoPath = context.workingDir;

    try {
      // Stage files
      if (files.length > 0) {
        // Stage specific files
        for (const file of files) {
          await add({
            fs,
            dir: repoPath,
            filepath: file,
          });
        }
      }

      // Create commit
      const sha = await commit({
        fs,
        dir: repoPath,
        message,
        author: author || {
          name: 'Demiurge',
          email: 'demiurge@local',
        },
      });

      return {
        success: true,
        data: {
          sha,
          message,
          files: files.length > 0 ? files : ['all staged changes'],
        },
        executionTimeMs: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: `Git commit failed: ${error instanceof Error ? error.message : String(error)}`,
        executionTimeMs: 0,
      };
    }
  }
}
