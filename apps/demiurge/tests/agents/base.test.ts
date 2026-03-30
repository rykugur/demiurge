import { describe, it, expect } from 'bun:test';
import { BaseAgent } from '@/agents/base';
import { AgentType, Task, TaskStatus, TaskPriority } from '@/core/types';

class TestAgent extends BaseAgent {
  constructor() {
    super(AgentType.PALINO, 'Test Agent', 'Give me a task, and I will see it done.');
  }

  async executeTask(task: Task): Promise<{ success: boolean; output: string; actions: [] }> {
    return {
      success: true,
      output: `Executed: ${task.description}`,
      actions: [],
    };
  }
}

describe('BaseAgent', () => {
  it('should have correct type and name', () => {
    const agent = new TestAgent();
    expect(agent.getType()).toBe(AgentType.PALINO);
    expect(agent.getName()).toBe('Test Agent');
  });

  it('should provide persona prompt', () => {
    const agent = new TestAgent();
    const prompt = agent.getPersonaPrompt();
    
    expect(prompt).toContain('Test Agent');
    expect(prompt).toContain('palino');
    expect(prompt).toContain('Give me a task');
  });

  it('should execute task and return result', async () => {
    const agent = new TestAgent();
    const task: Task = {
      id: 'task-001',
      directive_id: 'dir-001',
      agent_type: AgentType.PALINO,
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      description: 'Test task description',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await agent.executeTask(task);
    
    expect(result.success).toBe(true);
    expect(result.output).toContain('Test task description');
    expect(result.actions).toEqual([]);
  });
});
