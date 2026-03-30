/**
 * Base types for the skills system
 */

export interface SkillParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  default?: unknown;
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  parameters: SkillParameter[];
  returns: {
    type: string;
    description: string;
  };
  readonly: boolean;
  category: string;
}

export interface SkillContext {
  // Execution context for skills
  workingDir: string;
  agentName: string;
  taskId: string;
  // Audit trail
  audit: {
    log: (action: string, details: unknown) => void;
  };
}

export interface SkillResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  executionTimeMs: number;
}

export type SkillFunction = (
  params: Record<string, unknown>,
  context: SkillContext
) => Promise<SkillResult>;

export interface Skill {
  definition: SkillDefinition;
  execute: SkillFunction;
}
