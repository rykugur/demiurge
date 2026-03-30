import { TaskPriority } from '@/core/types';

export interface CostEstimate {
  tier: number;
  provider: string;
  relativeCost: string;
  estimatedTokens?: number;
}

export class TaskRouter {
  private keywords: Map<number, string[]>;

  constructor() {
    this.keywords = new Map([
      [1, [
        'documentation', 'doc', 'comment', 'readme', 'guide',
        'explain', 'describe', 'summarize', 'review', 'analyze',
      ]],
      [2, [
        'implement', 'create', 'add', 'feature', 'function',
        'component', 'test', 'refactor', 'fix', 'bug',
      ]],
      [3, [
        'architecture', 'design', 'schema', 'security', 'vulnerability',
        'performance', 'optimize', 'critical', 'infrastructure',
        'plan', 'strategy', 'system',
      ]],
    ]);
  }

  selectTier(description: string, priority: TaskPriority): number {
    const desc = description.toLowerCase();
    
    // Critical priority always gets tier 3
    if (priority === TaskPriority.CRITICAL) {
      return 3;
    }

    // Check for tier 3 keywords (highest priority)
    const tier3Keywords = this.keywords.get(3) || [];
    if (tier3Keywords.some(kw => desc.includes(kw))) {
      return 3;
    }

    // Check for tier 1 keywords (documentation tasks)
    const tier1Keywords = this.keywords.get(1) || [];
    if (tier1Keywords.some(kw => desc.includes(kw))) {
      return 1;
    }

    // Default to tier 2 for implementation tasks
    return 2;
  }

  getCostEstimate(tier: number): CostEstimate {
    const estimates: Record<number, CostEstimate> = {
      1: {
        tier: 1,
        provider: 'OpenRouter / OpenCode Zen Free',
        relativeCost: 'Low (Free)',
      },
      2: {
        tier: 2,
        provider: 'OpenCode Go',
        relativeCost: 'Medium',
      },
      3: {
        tier: 3,
        provider: 'Anthropic Claude',
        relativeCost: 'High',
      },
      4: {
        tier: 4,
        provider: 'Ollama (Local)',
        relativeCost: 'Free (Compute)',
      },
    };

    return estimates[tier] || estimates[2];
  }

  shouldUseLocal(description: string): boolean {
    const localKeywords = [
      'private', 'sensitive', 'secret', 'credential',
      'password', 'token', 'key', 'internal-only',
    ];
    
    const desc = description.toLowerCase();
    return localKeywords.some(kw => desc.includes(kw));
  }

  getRecommendedProvider(taskDescription: string, priority: TaskPriority): {
    tier: number;
    provider: string;
    reason: string;
  } {
    if (this.shouldUseLocal(taskDescription)) {
      return {
        tier: 4,
        provider: 'Ollama',
        reason: 'Task involves sensitive data - using local LLM for privacy',
      };
    }

    const tier = this.selectTier(taskDescription, priority);
    const estimate = this.getCostEstimate(tier);

    let reason = '';
    switch (tier) {
      case 1:
        reason = 'Documentation/analysis task - using cost-effective model';
        break;
      case 2:
        reason = 'Standard implementation task - using primary provider';
        break;
      case 3:
        reason = priority === TaskPriority.CRITICAL 
          ? 'Critical priority task - using premium model'
          : 'Complex architecture/security task - using premium model';
        break;
    }

    return {
      tier,
      provider: estimate.provider,
      reason,
    };
  }
}

export default TaskRouter;
