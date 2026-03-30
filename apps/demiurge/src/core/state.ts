import { Database as BunDatabase } from 'bun:sqlite';
import type { Task, TaskStatus, AgentType, TaskPriority } from '@/core/types';

export class Database {
  private db: BunDatabase;

  constructor(dbPath: string) {
    this.db = new BunDatabase(dbPath, { create: true });
    this.init();
  }

  private init(): void {
    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        directive_id TEXT NOT NULL,
        agent_type TEXT NOT NULL,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        description TEXT NOT NULL,
        context TEXT,
        result TEXT,
        error TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        completed_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_directive ON tasks(directive_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_agent ON tasks(agent_type);

      CREATE TABLE IF NOT EXISTS directives (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        processed_at TEXT,
        status TEXT NOT NULL,
        raw_content TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_directives_status ON directives(status);

      CREATE TABLE IF NOT EXISTS agent_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id TEXT NOT NULL,
        agent_type TEXT NOT NULL,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_logs_task ON agent_logs(task_id);
    `);
  }

  createTask(params: {
    directive_id: string;
    agent_type: AgentType | string;
    status: TaskStatus | string;
    priority: TaskPriority | string;
    description: string;
    context?: string;
  }): Task {
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, directive_id, agent_type, status, priority, description, context, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      params.directive_id,
      params.agent_type,
      params.status,
      params.priority,
      params.description,
      params.context || null,
      now,
      now
    );

    return this.getTask(id)!;
  }

  getTask(id: string): Task | undefined {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
    const row = stmt.get(id) as Record<string, unknown> | undefined;
    
    if (!row) return undefined;

    return this.rowToTask(row);
  }

  updateTaskStatus(id: string, status: TaskStatus | string, result?: string, error?: string): void {
    const now = new Date().toISOString();
    const completedAt = status === 'completed' || status === 'failed' ? now : null;

    const stmt = this.db.prepare(`
      UPDATE tasks 
      SET status = ?, result = ?, error = ?, updated_at = ?, completed_at = ?
      WHERE id = ?
    `);

    stmt.run(status, result || null, error || null, now, completedAt, id);
  }

  getPendingTasks(): Task[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks 
      WHERE status = 'pending' 
      ORDER BY 
        CASE priority 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          ELSE 4 
        END,
        created_at ASC
    `);

    const rows = stmt.all() as Record<string, unknown>[];
    return rows.map(row => this.rowToTask(row));
  }

  getTasksByDirective(directiveId: string): Task[] {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE directive_id = ? ORDER BY created_at ASC');
    const rows = stmt.all(directiveId) as Record<string, unknown>[];
    return rows.map(row => this.rowToTask(row));
  }

  logMessage(taskId: string, agentType: string, level: string, message: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO agent_logs (task_id, agent_type, level, message, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(taskId, agentType, level, message, new Date().toISOString());
  }

  getLogsForTask(taskId: string): Array<{
    id: number;
    task_id: string;
    agent_type: string;
    level: string;
    message: string;
    timestamp: string;
  }> {
    const stmt = this.db.prepare(`
      SELECT * FROM agent_logs WHERE task_id = ? ORDER BY timestamp ASC
    `);

    return stmt.all(taskId) as Array<{
      id: number;
      task_id: string;
      agent_type: string;
      level: string;
      message: string;
      timestamp: string;
    }>;
  }

  private rowToTask(row: Record<string, unknown>): Task {
    return {
      id: row.id as string,
      directive_id: row.directive_id as string,
      agent_type: row.agent_type as string as AgentType,
      status: row.status as string as TaskStatus,
      priority: row.priority as string as TaskPriority,
      description: row.description as string,
      context: row.context as string | undefined,
      result: row.result as string | undefined,
      error: row.error as string | undefined,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      completed_at: row.completed_at as string | undefined,
    };
  }

  close(): void {
    this.db.close();
  }
}

export default Database;
