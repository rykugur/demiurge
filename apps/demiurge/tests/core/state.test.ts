import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Database } from '@/core/state';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Database', () => {
  let dbPath: string;
  let db: Database;

  beforeEach(() => {
    dbPath = join(tmpdir(), `test-demiurge-${Date.now()}.db`);
    db = new Database(dbPath);
  });

  afterEach(() => {
    db.close();
    if (existsSync(dbPath)) {
      unlinkSync(dbPath);
    }
  });

  it('should create task', () => {
    const task = db.createTask({
      directive_id: 'dir-001',
      agent_type: 'hadrian',
      status: 'pending',
      priority: 'high',
      description: 'Test task',
      context: 'Test context',
    });

    expect(task.id).toBeDefined();
    expect(task.agent_type).toBe('hadrian');
    expect(task.status).toBe('pending');
  });

  it('should get task by id', () => {
    const created = db.createTask({
      directive_id: 'dir-001',
      agent_type: 'hadrian',
      status: 'pending',
      priority: 'high',
      description: 'Test task',
    });

    const retrieved = db.getTask(created.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(created.id);
    expect(retrieved?.description).toBe('Test task');
  });

  it('should update task status', () => {
    const task = db.createTask({
      directive_id: 'dir-001',
      agent_type: 'palino',
      status: 'pending',
      priority: 'medium',
      description: 'Test task',
    });

    db.updateTaskStatus(task.id, 'in_progress');
    const updated = db.getTask(task.id);
    expect(updated?.status).toBe('in_progress');
  });

  it('should list pending tasks', () => {
    db.createTask({
      directive_id: 'dir-001',
      agent_type: 'hadrian',
      status: 'pending',
      priority: 'high',
      description: 'Pending task 1',
    });

    db.createTask({
      directive_id: 'dir-002',
      agent_type: 'valka',
      status: 'completed',
      priority: 'low',
      description: 'Completed task',
    });

    db.createTask({
      directive_id: 'dir-003',
      agent_type: 'palino',
      status: 'pending',
      priority: 'medium',
      description: 'Pending task 2',
    });

    const pending = db.getPendingTasks();
    expect(pending.length).toBe(2);
    expect(pending.every(t => t.status === 'pending')).toBe(true);
  });
});
