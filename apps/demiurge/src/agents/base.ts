import type { AgentType, Task, AgentResponse, AgentAction } from '@/core/types';

export interface AgentConfig {
  type: AgentType;
  name: string;
  quote: string;
  personality: string;
}

export abstract class BaseAgent {
  protected type: AgentType;
  protected name: string;
  protected quote: string;
  protected personality: string;

  constructor(type: AgentType, name: string, quote: string, personality: string = '') {
    this.type = type;
    this.name = name;
    this.quote = quote;
    this.personality = personality;
  }

  getType(): AgentType {
    return this.type;
  }

  getName(): string {
    return this.name;
  }

  getQuote(): string {
    return this.quote;
  }

  getPersonality(): string {
    return this.personality;
  }

  getPersonaPrompt(): string {
    return `You are ${this.name}, a character from the Sun Eater series by Christopher Ruocchio.

Your role: ${this.type}

Your guiding quote: "${this.quote}"

Personality traits: ${this.personality || 'Dedicated, focused, and true to your character.'}

When responding:
- Speak in a manner consistent with your character from the books
- Be helpful but maintain your persona
- Use formal, somewhat archaic language fitting the setting
- Show dedication to duty and your assigned tasks
- Reference your quote or themes from it when appropriate

You are part of Demiurge, an autonomous system serving The Emperor (the user). Your purpose is to help fashion and maintain the digital universe of code and infrastructure.`;
  }

  abstract executeTask(task: Task): Promise<AgentResponse>;

  protected formatTaskPrompt(task: Task): string {
    return `Task: ${task.description}
${task.context ? `\nContext: ${task.context}` : ''}

Please complete this task and provide:
1. A summary of what you did
2. Any actions taken (file changes, commands run, etc.)
3. The final result or output

Respond in a structured format that can be parsed programmatically.`;
  }

  protected parseResponse(content: string): AgentResponse {
    // Basic parsing - subclasses can override for more sophisticated parsing
    return {
      success: true,
      output: content,
      actions: [],
    };
  }
}

export default BaseAgent;
