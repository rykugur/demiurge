import { z } from 'zod';

export enum AgentType {
  HADRIAN = 'hadrian',
  VALKA = 'valka',
  PALINO = 'palino',
  LORIAN = 'lorian',
  OTAVIA = 'otavia',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export const DirectiveSchema = z.object({
  id: z.string(),
  created_at: z.string().datetime(),
  from: z.literal('The Emperor'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  task: z.string(),
  context: z.string().optional(),
  expected_output: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type Directive = z.infer<typeof DirectiveSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  directive_id: z.string(),
  agent_type: z.nativeEnum(AgentType),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(TaskPriority),
  description: z.string(),
  context: z.string().optional(),
  result: z.string().optional(),
  error: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

export interface AgentResponse {
  success: boolean;
  output: string;
  actions: AgentAction[];
  error?: string;
}

export interface AgentAction {
  type: 'commit' | 'create_file' | 'modify_file' | 'delete_file' | 'run_command' | 'file_read';
  description?: string;
  payload?: unknown;
  path?: string;
  size?: number;
}

export interface LLMProvider {
  name: string;
  tier: number;
  isAvailable(): Promise<boolean>;
  generate(prompt: string, systemPrompt?: string): Promise<string>;
}
