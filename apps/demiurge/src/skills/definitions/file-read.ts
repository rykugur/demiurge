import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { Skill, SkillContext, SkillResult } from '@/skills/types';

export class FileReadSkill implements Skill {
  definition = {
    id: 'file-read',
    name: 'Read File',
    description: 'Reads the contents of a file from the filesystem',
    parameters: [
      {
        name: 'path',
        type: 'string' as const,
        description: 'Path to the file to read (relative to working directory)',
        required: true,
      },
      {
        name: 'encoding',
        type: 'string' as const,
        description: 'File encoding (default: utf-8)',
        required: false,
        default: 'utf-8',
      },
    ],
    returns: {
      type: 'object',
      description: 'File contents and metadata',
    },
    readonly: true,
    category: 'filesystem',
  };

  async execute(
    params: Record<string, unknown>,
    context: SkillContext
  ): Promise<SkillResult> {
    const filePath = params.path as string;
    const encoding = (params.encoding as string) || 'utf-8';

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

    // Check if file exists
    if (!existsSync(resolvedPath)) {
      return {
        success: false,
        error: `File not found: ${filePath}`,
        executionTimeMs: 0,
      };
    }

    try {
      const content = readFileSync(resolvedPath, encoding as BufferEncoding);
      
      return {
        success: true,
        data: {
          path: filePath,
          content,
          size: Buffer.byteLength(content, encoding as BufferEncoding),
        },
        executionTimeMs: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to read file: ${error instanceof Error ? error.message : String(error)}`,
        executionTimeMs: 0,
      };
    }
  }
}
