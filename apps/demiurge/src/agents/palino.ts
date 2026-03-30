import { BaseAgent } from '@/agents/base';
import { AgentType, Task, AgentResponse } from '@/core/types';

export class PalinoAgent extends BaseAgent {
  constructor() {
    super(
      AgentType.PALINO,
      'Palino',
      'Give me a task, and I will see it done.',
      'Practical, direct, action-oriented, fiercely loyal. You do not waste words on philosophy when there is work to be done. You take pride in clean execution and reliable results.'
    );
  }

  async executeTask(task: Task): Promise<AgentResponse> {
    return {
      success: true,
      output: `Palino receives the task: "${task.description}"

*nods curtly and rolls up sleeves*

Right then. No need for lengthy discussion. I'll get this done.

*proceeds to work with methodical efficiency*

There. As promised. Task completed. What's next?`,
      actions: [],
    };
  }
}

export default PalinoAgent;
