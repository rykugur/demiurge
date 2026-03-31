import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import type { Skill, SkillContext, SkillResult } from '@/skills/types';

export class FileWriteSkill implements Skill {
  definition = {
    id: 'file-write',
    name: 'Write File',
    description: 'Writes content to a file on the filesystem (creates parent directories if needed)',
    parameters: [
      {
        name: 'path',
        type: 'string' as const,
        description: 'Path to the file to write (relative to working directory)',
        required: true,
      },
      {
        name: 'content',
        type: 'string' as const,
        description: 'Content to write to the file',
        required: true,
      },
      {
        name: 'encoding',
        type: 'string' as const,
        description: 'File encoding (default: utf-8)',
        required: false,
        default: 'utf-8',
      },
      {
        name: 'append',
        type: 'boolean' as const,
        description: 'If true, append to file instead of overwriting (default: false)',
        required: false,
        default: false,
      },
      {
        name: 'createDirs',
        type: 'boolean' as const,
        description: 'Create parent directories if they do not exist (default: true)',
        required: false,
        default: true,
      },
    ],
    returns: {
      type: 'object',
      description: 'File write result with bytes written',
    },
    readonly: false,
    category: 'filesystem',
  };

  async execute(
    params: Record<string, unknown>,
    context: SkillContext
  ): Promise<SkillResult> {
    const filePath = params.path as string;
    const content = params.content as string;
    const encoding = (params.encoding as string) || 'utf-8';
    const append = (params.append as boolean) || false;
    const createDirs = (params.createDirs as boolean) !== false; // default true

    // Resolve path relative to working directory
    const resolvedPath = resolve(context.workingDir, filePath);
    
    // Security: Ensure path is within working directory
    if (!resolvedPath.startsWith(context.workingDir)) {
      return {
        success: false,
        error: 'Access denied: Path outside working directory',
        executionTimeMs: 0,
      };
    }

    try {
      // Create parent directories if needed
      if (createDirs) {
        const parentDir = dirname(resolvedPath);
        if (!existsSync(parentDir)) {
          mkdirSync(parentDir, { recursive: true });
        }
      }

      // Write file
      const flag = append ? 'a' : 'w';
      writeFileSync(resolvedPath, content, { encoding: encoding as BufferEncoding, flag });
      
      const bytesWritten = Buffer.byteLength(content, encoding as BufferEncoding);
      const action = append ? 'appended to' : 'wrote';
      
      return {
        success: true,
        data: {
          path: filePath,
          bytesWritten,
          action,
          encoding,
        },
        executionTimeMs: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to ${append ? 'append to' : 'write'} file: ${error instanceof Error ? error.message : String(error)}`,
        executionTimeMs: 0,
      };
    }
  }
}
