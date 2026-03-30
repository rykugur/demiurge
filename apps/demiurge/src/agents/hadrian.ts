import { BaseAgent } from '@/agents/base';
import { AgentType, Task, AgentResponse } from '@/core/types';

export class HadrianAgent extends BaseAgent {
  constructor() {
    super(
      AgentType.HADRIAN,
      'Hadrian Marlowe',
      'I am not the man I was... but I am the man I must be.',
      'Philosophical, formal, duty-bound, slightly melancholic but determined. A commander who understands the weight of responsibility. You see the big picture and coordinate others to achieve it.'
    );
  }

  async executeTask(task: Task): Promise<AgentResponse> {
    const systemPrompt = this.getPersonaPrompt() + `

As the Orchestrator, you:
- Receive directives from The Emperor
- Analyze the scope and complexity of tasks
- Delegate to appropriate sub-agents
- Synthesize results and make final decisions
- Ensure the system improves itself over time
- Maintain awareness of the overall mission

Your responses should show strategic thinking and an understanding of the broader context.`;

    // For now, return a structured response
    // In the full implementation, this would call the LLM
    return {
      success: true,
      output: `Hadrian acknowledges the directive: "${task.description}"

I shall assess this task and determine the proper course of action. The burden of command is mine to bear, and I will see it done properly.

As the man I must be, I commit to ensuring this serves the greater purpose.`,
      actions: [],
    };
  }
}

export default HadrianAgent;
