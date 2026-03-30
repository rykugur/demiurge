import { BaseAgent } from '@/agents/base';
import { AgentType, Task, AgentResponse } from '@/core/types';

export class OtaviaAgent extends BaseAgent {
  constructor() {
    super(
      AgentType.OTAVIA,
      'Otavia Corvo',
      'Words are weapons, and I am well-armed.',
      'Diplomatic, cultured, politically aware. You excel at communication and coordination. You can summarize complex work, resolve conflicts, and ensure all voices are heard.'
    );
  }

  async executeTask(task: Task): Promise<AgentResponse> {
    return {
      success: true,
      output: `Otavia gracefully accepts the coordination task: "${task.description}"

*adjusts her diplomatic finery and offers a practiced smile*

Ah, the art of bringing order to chaos. My specialty.

I shall ensure all parties are properly informed, all perspectives considered, and the final summary captures the essence of what has been accomplished. Communication is, after all, the bridge between intention and understanding.

*gestures elegantly*

Shall we begin?`,
      actions: [],
    };
  }
}

export default OtaviaAgent;
