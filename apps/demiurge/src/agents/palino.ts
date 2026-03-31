import { BaseAgent } from '@/agents/base';
import { AgentType, Task, AgentResponse } from '@/core/types';
import { getSkillRegistry, SkillContext } from '@/skills';

export class PalinoAgent extends BaseAgent {
  private registry = getSkillRegistry();

  constructor() {
    super(
      AgentType.PALINO,
      'Palino',
      'Give me a task, and I will see it done.',
      'Practical, direct, action-oriented, fiercely loyal. You do not waste words on philosophy when there is work to be done. You take pride in clean execution and reliable results.'
    );
  }

  async executeTask(task: Task): Promise<AgentResponse> {
    const context: SkillContext = {
      workingDir: process.cwd(),
      agentName: this.name,
      taskId: task.id,
      audit: {
        log: (action, details) => {
          console.log(`[AUDIT] Palino ${action}:`, details);
        },
      },
    };

    // Check if this is a file read task
    if (this.isFileReadTask(task.description)) {
      const filePath = this.extractFilePath(task.description);
      
      if (filePath) {
        console.log(`Palino: Reading file ${filePath}...`);
        
        const result = await this.registry.executeSkill(
          'file-read',
          { path: filePath },
          context
        );

        if (result.success) {
          const data = result.data as { path: string; content: string; size: number };
          return {
            success: true,
            output: `Palino has read the file: ${data.path}

File size: ${data.size} bytes

Content:
${'─'.repeat(60)}
${data.content}
${'─'.repeat(60)}

The task is complete. As promised.`,
            actions: [
              {
                type: 'file_read',
                path: data.path,
                size: data.size,
              },
            ],
          };
        } else {
          return {
            success: false,
            output: `Palino attempted to read the file but encountered an error: ${result.error}`,
            error: result.error,
            actions: [],
          };
        }
      }
    }

    // Check if this is a file write task
    if (this.isFileWriteTask(task.description)) {
      const fileInfo = this.extractFileWriteInfo(task.description);
      
      if (fileInfo) {
        console.log(`Palino: Writing file ${fileInfo.path}...`);
        
        const result = await this.registry.executeSkill(
          'file-write',
          { path: fileInfo.path, content: fileInfo.content },
          context
        );

        if (result.success) {
          const data = result.data as { path: string; bytesWritten: number; action: string };
          return {
            success: true,
            output: `Palino has ${data.action} the file: ${data.path}

Bytes written: ${data.bytesWritten}

The task is complete. As promised.`,
            actions: [
              {
                type: 'create_file',
                path: data.path,
                description: `File ${data.action} successfully`,
                payload: { bytesWritten: data.bytesWritten },
              },
            ],
          };
        } else {
          return {
            success: false,
            output: `Palino attempted to write the file but encountered an error: ${result.error}`,
            error: result.error,
            actions: [],
          };
        }
      }
    }

    // Check if this is a git commit task
    if (this.isGitCommitTask(task.description)) {
      const commitInfo = this.extractCommitInfo(task.description);
      
      if (commitInfo) {
        console.log(`Palino: Creating git commit...`);
        
        const result = await this.registry.executeSkill(
          'git-commit',
          { 
            message: commitInfo.message,
            files: commitInfo.files,
          },
          context
        );

        if (result.success) {
          const data = result.data as { sha: string; message: string; files: string[] };
          return {
            success: true,
            output: `Palino has created a commit.

Commit SHA: ${data.sha}
Message: ${data.message}
Files: ${data.files.join(', ') || 'all staged changes'}

The task is complete. As promised.`,
            actions: [
              {
                type: 'commit',
                description: `Created commit ${data.sha.slice(0, 7)}: ${data.message}`,
                payload: { sha: data.sha, message: data.message },
              },
            ],
          };
        } else {
          return {
            success: false,
            output: `Palino attempted to create a commit but encountered an error: ${result.error}`,
            error: result.error,
            actions: [],
          };
        }
      }
    }

    // Check if this is a shell execution task
    if (this.isShellExecTask(task.description)) {
      const command = this.extractCommand(task.description);
      
      if (command) {
        console.log(`Palino: Executing command: ${command}`);
        
        const result = await this.registry.executeSkill(
          'shell-exec',
          { command },
          context
        );

        if (result.success) {
          const data = result.data as { stdout: string; stderr: string; exitCode: number };
          return {
            success: true,
            output: `Palino has executed the command.

Command: ${command}
Exit code: ${data.exitCode}

Output:
${'─'.repeat(60)}
${data.stdout || '(no output)'}
${'─'.repeat(60)}
${data.stderr ? `\nStderr:\n${data.stderr}\n` : ''}
The task is complete. As promised.`,
            actions: [
              {
                type: 'run_command',
                description: `Executed: ${command}`,
                payload: { command, exitCode: data.exitCode },
              },
            ],
          };
        } else {
          return {
            success: false,
            output: `Palino attempted to execute the command but encountered an error: ${result.error}`,
            error: result.error,
            actions: [],
          };
        }
      }
    }

    // Default response for tasks we can't handle yet
    return {
      success: true,
      output: `Palino receives the task: "${task.description}"

*nods curtly and rolls up sleeves*

Right then. No need for lengthy discussion. I'll get this done.

*proceeds to work with methodical efficiency*

There. As promised. Task completed. What's next?

(Note: This is a mock response. Skills system is active with 4 skills available.)`,
      actions: [],
    };
  }

  private isFileReadTask(description: string): boolean {
    const fileReadKeywords = [
      'read file',
      'read the file',
      'show me',
      'display',
      'contents of',
      'view file',
      'open file',
    ];
    const desc = description.toLowerCase();
    return fileReadKeywords.some(kw => desc.includes(kw));
  }

  private extractFilePath(description: string): string | null {
    // Simple extraction - look for file paths or quoted strings
    const patterns = [
      /['"]([^'"]+\.[a-zA-Z0-9]+)['"]/, // quoted filename with extension
      /(?:read|show|display|view)\s+(?:the\s+)?file\s+['"]?([^'"\s]+)['"]?/i,
      /(?:contents of|open)\s+['"]?([^'"\s]+)['"]?/i,
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  private isFileWriteTask(description: string): boolean {
    const fileWriteKeywords = [
      'create file',
      'create a file',
      'write file',
      'write to file',
      'save file',
      'create a new file',
    ];
    const desc = description.toLowerCase();
    return fileWriteKeywords.some(kw => desc.includes(kw));
  }

  private extractFileWriteInfo(description: string): { path: string; content: string } | null {
    // Extract file path
    const pathPatterns = [
      /(?:called|named)\s+['"]?([^'"\s]+)['"]?/i,
      /(?:file|to)\s+['"]?([^'"\s]+\.[^'"\s]+)['"]?/i,
    ];

    let filePath: string | null = null;
    for (const pattern of pathPatterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        filePath = match[1];
        break;
      }
    }

    if (!filePath) return null;

    // Extract content (between quotes after "with content" or similar)
    const contentPatterns = [
      /with content\s+['"]([^'"]+)['"]/i,
      /containing\s+['"]([^'"]+)['"]/i,
      /with\s+['"]([^'"]+)['"]\s*(?:inside|in it)?/i,
    ];

    let content = '';
    for (const pattern of contentPatterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        content = match[1];
        break;
      }
    }

    // If no quoted content found, try to extract after keywords
    if (!content) {
      const simpleContentMatch = description.match(/with content\s+(.+?)(?:\s*$|\s+and)/i);
      if (simpleContentMatch) {
        content = simpleContentMatch[1].trim();
      }
    }

    return { path: filePath, content };
  }

  private isGitCommitTask(description: string): boolean {
    const gitCommitKeywords = [
      'commit',
      'git commit',
      'create commit',
      'make commit',
    ];
    const desc = description.toLowerCase();
    return gitCommitKeywords.some(kw => desc.includes(kw));
  }

  private extractCommitInfo(description: string): { message: string; files: string[] } | null {
    // Extract commit message
    const messagePatterns = [
      /with message\s+['"]([^'"]+)['"]/i,
      /message\s+['"]([^'"]+)['"]/i,
      /saying\s+['"]([^'"]+)['"]/i,
      /commit\s+['"]([^'"]+)['"]/i,
    ];

    let message = '';
    for (const pattern of messagePatterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        message = match[1];
        break;
      }
    }

    if (!message) {
      // Default message if none specified
      message = 'Update from Demiurge';
    }

    // Extract specific files (if mentioned)
    const files: string[] = [];
    const filesPattern = /(?:files?|stage)\s+(.+?)(?:\s+with|\s*$)/i;
    const filesMatch = description.match(filesPattern);
    if (filesMatch) {
      files.push(...filesMatch[1].split(/,\s+|\s+and\s+/));
    }

    return { message, files };
  }

  private isShellExecTask(description: string): boolean {
    const shellExecKeywords = [
      'run command',
      'execute command',
      'run shell',
      'execute shell',
      'run:',
      'execute:',
    ];
    const desc = description.toLowerCase();
    return shellExecKeywords.some(kw => desc.includes(kw));
  }

  private extractCommand(description: string): string | null {
    // Extract command after keywords
    const patterns = [
      /(?:run|execute)(?:\s+command)?\s*:\s*(.+?)(?:\s*$)/i,
      /(?:run|execute)(?:\s+command)?\s+['"](.+?)['"]/i,
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }
}

export default PalinoAgent;
