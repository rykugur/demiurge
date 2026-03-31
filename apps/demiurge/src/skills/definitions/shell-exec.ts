import { exec } from 'child_process';
import { promisify } from 'util';
import type { Skill, SkillContext, SkillResult } from '@/skills/types';

const execAsync = promisify(exec);

export class ShellExecSkill implements Skill {
  definition = {
    id: 'shell-exec',
    name: 'Shell Execute',
    description: 'Executes a shell command and returns the output',
    parameters: [
      {
        name: 'command',
        type: 'string' as const,
        description: 'Shell command to execute',
        required: true,
      },
      {
        name: 'cwd',
        type: 'string' as const,
        description: 'Working directory for command execution (default: current working directory)',
        required: false,
      },
      {
        name: 'timeout',
        type: 'number' as const,
        description: 'Command timeout in milliseconds (default: 30000)',
        required: false,
        default: 30000,
      },
      {
        name: 'env',
        type: 'object' as const,
        description: 'Environment variables to set for the command',
        required: false,
        default: {},
      },
    ],
    returns: {
      type: 'object',
      description: 'Command execution result with stdout, stderr, and exit code',
    },
    readonly: false,
    category: 'shell',
  };

  async execute(
    params: Record<string, unknown>,
    context: SkillContext
  ): Promise<SkillResult> {
    const command = params.command as string;
    const cwd = (params.cwd as string) || context.workingDir;
    const timeout = (params.timeout as number) || 30000;
    const env = (params.env as Record<string, string>) || {};

    // Security: Block dangerous commands
    const blockedCommands = [
      'rm -rf /',
      'rm -rf /*',
      'dd if=/dev/zero',
      'mkfs',
      '>:/dev/sda',
    ];
    
    const normalizedCommand = command.toLowerCase().replace(/\s+/g, ' ');
    for (const blocked of blockedCommands) {
      if (normalizedCommand.includes(blocked)) {
        return {
          success: false,
          error: `Command blocked for security: "${blocked}"`,
          executionTimeMs: 0,
        };
      }
    }

    const startTime = Date.now();

    try {
      // Execute command using Node.js exec
      const { stdout, stderr } = await execAsync(command, {
        cwd,
        env: { ...process.env, ...env },
        timeout,
      });

      const executionTimeMs = Date.now() - startTime;

      return {
        success: true,
        data: {
          stdout: stdout.toString(),
          stderr: stderr.toString(),
          exitCode: 0,
        },
        executionTimeMs,
      };
    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      
      // exec throws on non-zero exit codes, but we still want the output
      if (error && typeof error === 'object' && 'stdout' in error) {
        const execError = error as { stdout: string; stderr: string; code: number };
        return {
          success: execError.code === 0,
          data: {
            stdout: execError.stdout?.toString() || '',
            stderr: execError.stderr?.toString() || '',
            exitCode: execError.code,
          },
          executionTimeMs,
        };
      }
      
      return {
        success: false,
        error: `Command failed: ${error instanceof Error ? error.message : String(error)}`,
        executionTimeMs,
      };
    }
  }
}
