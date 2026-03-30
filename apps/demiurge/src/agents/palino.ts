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

    // Default response for tasks we can't handle yet
    return {
      success: true,
      output: `Palino receives the task: "${task.description}"

*nods curtly and rolls up sleeves*

Right then. No need for lengthy discussion. I'll get this done.

*proceeds to work with methodical efficiency*

There. As promised. Task completed. What's next?

(Note: This is a mock response. Skills system is active but limited skills available.)`,
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
}

export default PalinoAgent;
