import type { Skill, SkillContext, SkillResult } from './types';
import { FileReadSkill } from './definitions/file-read';
import { FileWriteSkill } from './definitions/file-write';

export class SkillRegistry {
  private skills: Map<string, Skill> = new Map();

  constructor() {
    // Register built-in skills
    this.registerSkill(new FileReadSkill());
    this.registerSkill(new FileWriteSkill());
  }

  registerSkill(skill: Skill): void {
    this.skills.set(skill.definition.id, skill);
    console.log(`SkillRegistry: Registered skill '${skill.definition.id}'`);
  }

  getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  getSkillDefinitions() {
    return this.getAllSkills().map(s => s.definition);
  }

  async executeSkill(
    skillId: string,
    params: Record<string, unknown>,
    context: SkillContext
  ): Promise<SkillResult> {
    const skill = this.getSkill(skillId);
    
    if (!skill) {
      return {
        success: false,
        error: `Skill '${skillId}' not found`,
        executionTimeMs: 0,
      };
    }

    const startTime = Date.now();
    
    try {
      // Log execution attempt
      context.audit.log('skill_execute_start', {
        skillId,
        params: this.sanitizeParams(params),
        agent: context.agentName,
        taskId: context.taskId,
      });

      // Validate required parameters
      const validationError = this.validateParams(skill, params);
      if (validationError) {
        return {
          success: false,
          error: validationError,
          executionTimeMs: Date.now() - startTime,
        };
      }

      // Execute skill
      const result = await skill.execute(params, context);
      result.executionTimeMs = Date.now() - startTime;

      // Log execution result
      context.audit.log('skill_execute_complete', {
        skillId,
        success: result.success,
        executionTimeMs: result.executionTimeMs,
        agent: context.agentName,
        taskId: context.taskId,
      });

      return result;

    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      
      context.audit.log('skill_execute_error', {
        skillId,
        error: error instanceof Error ? error.message : String(error),
        executionTimeMs,
        agent: context.agentName,
        taskId: context.taskId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTimeMs,
      };
    }
  }

  private validateParams(skill: Skill, params: Record<string, unknown>): string | null {
    for (const param of skill.definition.parameters) {
      if (param.required && !(param.name in params)) {
        return `Missing required parameter: ${param.name}`;
      }
    }
    return null;
  }

  private sanitizeParams(params: Record<string, unknown>): Record<string, unknown> {
    // Remove sensitive data from logs (basic implementation)
    const sanitized = { ...params };
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'credential'];
    
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
}

// Singleton instance
let registry: SkillRegistry | null = null;

export function getSkillRegistry(): SkillRegistry {
  if (!registry) {
    registry = new SkillRegistry();
  }
  return registry;
}
