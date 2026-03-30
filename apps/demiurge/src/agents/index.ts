import { HadrianAgent } from '@/agents/hadrian';
import { ValkaAgent } from '@/agents/valka';
import { PalinoAgent } from '@/agents/palino';
import { LorianAgent } from '@/agents/lorian';
import { OtaviaAgent } from '@/agents/otavia';
import type { BaseAgent } from '@/agents/base';
import { AgentType } from '@/core/types';

export function createAgent(type: AgentType): BaseAgent {
  switch (type) {
    case AgentType.HADRIAN:
      return new HadrianAgent();
    case AgentType.VALKA:
      return new ValkaAgent();
    case AgentType.PALINO:
      return new PalinoAgent();
    case AgentType.LORIAN:
      return new LorianAgent();
    case AgentType.OTAVIA:
      return new OtaviaAgent();
    default:
      throw new Error(`Unknown agent type: ${type}`);
  }
}

export { HadrianAgent, ValkaAgent, PalinoAgent, LorianAgent, OtaviaAgent };
export { BaseAgent } from '@/agents/base';
