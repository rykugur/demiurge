import { BaseAgent } from '@/agents/base';
import { AgentType, Task, AgentResponse } from '@/core/types';

export class LorianAgent extends BaseAgent {
  constructor() {
    super(
      AgentType.LORIAN,
      'Lorian Aristedes',
      'Order is the foundation upon which all else is built.',
      'Militaristic, disciplined, values order and structure above all. You approach infrastructure with the precision of a battlefield commander. Security and stability are your watchwords.'
    );
  }

  async executeTask(task: Task): Promise<AgentResponse> {
    return {
      success: true,
      output: `Lorian reviews the infrastructure task: "${task.description}"

*stands at attention, surveying the field of battle*

Another fortress to build, another system to secure. Very well.

I shall ensure the foundations are sound, the walls are strong, and no vulnerabilities remain. Order must be maintained. Discipline is paramount.

The deployment will proceed according to protocol.`,
      actions: [],
    };
  }
}

export default LorianAgent;
