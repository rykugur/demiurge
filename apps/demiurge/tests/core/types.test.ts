import { describe, it, expect } from 'bun:test';
import { AgentType, TaskPriority, TaskStatus, DirectiveSchema, TaskSchema } from '@/core/types';

describe('Types', () => {
  it('should validate a correct directive', () => {
    const directive = {
      id: 'directive-001',
      created_at: '2025-03-30T10:00:00Z',
      from: 'The Emperor',
      priority: 'high',
      task: 'Test directive',
      context: 'Test context',
      expected_output: 'Test output',
      tags: ['test'],
    };
    
    const result = DirectiveSchema.safeParse(directive);
    expect(result.success).toBe(true);
  });

  it('should reject invalid directive (missing required field)', () => {
    const directive = {
      id: 'directive-001',
      // missing required fields
    };
    
    const result = DirectiveSchema.safeParse(directive);
    expect(result.success).toBe(false);
  });

  it('should have correct AgentType enum values', () => {
    expect(AgentType.HADRIAN).toBe('hadrian');
    expect(AgentType.VALKA).toBe('valka');
    expect(AgentType.PALINO).toBe('palino');
    expect(AgentType.LORIAN).toBe('lorian');
    expect(AgentType.OTAVIA).toBe('otavia');
  });
});
