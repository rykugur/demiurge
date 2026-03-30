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

  it('should validate a correct task', () => {
    const task = {
      id: 'task-001',
      directive_id: 'dir-001',
      agent_type: AgentType.HADRIAN,
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      description: 'Test task',
      context: 'Test context',
      result: 'Test result',
      created_at: '2025-03-30T10:00:00Z',
      updated_at: '2025-03-30T10:00:00Z',
    };
    
    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(true);
  });

  it('should reject task with invalid agent type', () => {
    const task = {
      id: 'task-001',
      directive_id: 'dir-001',
      agent_type: 'invalid_agent',
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      description: 'Test task',
      created_at: '2025-03-30T10:00:00Z',
      updated_at: '2025-03-30T10:00:00Z',
    };
    
    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(false);
  });

  it('should have correct TaskPriority enum values', () => {
    expect(TaskPriority.LOW).toBe('low');
    expect(TaskPriority.MEDIUM).toBe('medium');
    expect(TaskPriority.HIGH).toBe('high');
    expect(TaskPriority.CRITICAL).toBe('critical');
  });

  it('should have correct TaskStatus enum values', () => {
    expect(TaskStatus.PENDING).toBe('pending');
    expect(TaskStatus.IN_PROGRESS).toBe('in_progress');
    expect(TaskStatus.COMPLETED).toBe('completed');
    expect(TaskStatus.FAILED).toBe('failed');
    expect(TaskStatus.CANCELLED).toBe('cancelled');
  });

  it('should accept task without optional fields', () => {
    const task = {
      id: 'task-001',
      directive_id: 'dir-001',
      agent_type: AgentType.PALINO,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      description: 'Test task',
      created_at: '2025-03-30T10:00:00Z',
      updated_at: '2025-03-30T10:00:00Z',
      // context, result, error, completed_at omitted
    };
    
    const result = TaskSchema.safeParse(task);
    expect(result.success).toBe(true);
  });

  it('should reject directive with invalid priority', () => {
    const directive = {
      id: 'directive-001',
      created_at: '2025-03-30T10:00:00Z',
      from: 'The Emperor',
      priority: 'invalid_priority',
      task: 'Test directive',
    };
    
    const result = DirectiveSchema.safeParse(directive);
    expect(result.success).toBe(false);
  });

  it('should reject directive with invalid datetime', () => {
    const directive = {
      id: 'directive-001',
      created_at: 'not-a-datetime',
      from: 'The Emperor',
      priority: 'high',
      task: 'Test directive',
    };
    
    const result = DirectiveSchema.safeParse(directive);
    expect(result.success).toBe(false);
  });
});
