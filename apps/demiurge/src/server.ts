import { loadConfig, getConfig } from '@/core/config';
import { Database } from '@/core/state';
import { GitClient } from '@/core/git-client';
import { TaskRouter } from '@/core/task-router';
import { createAgent } from '@/agents';
import { AgentType, Task, TaskStatus, TaskPriority } from '@/core/types';
import { mkdirSync, existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import YAML from 'yaml';

interface Directive {
  id: string;
  created_at: string;
  from: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  task: string;
  context?: string;
  expected_output?: string;
  tags?: string[];
}

class DemiurgeServer {
  private db: Database;
  private git: GitClient;
  private router: TaskRouter;
  private config: ReturnType<typeof getConfig>;
  private running = false;

  constructor() {
    this.config = loadConfig();
    
    // Ensure directories exist
    if (!existsSync(this.config.storage.dataDir)) {
      mkdirSync(this.config.storage.dataDir, { recursive: true });
    }
    if (!existsSync(this.config.storage.workspacesDir)) {
      mkdirSync(this.config.storage.workspacesDir, { recursive: true });
    }
    if (!existsSync(this.config.storage.directivesDir)) {
      mkdirSync(this.config.storage.directivesDir, { recursive: true });
    }

    this.db = new Database(this.config.storage.databasePath);
    this.git = new GitClient(join(this.config.storage.dataDir, 'repo'));
    this.router = new TaskRouter();
  }

  async start(): Promise<void> {
    console.log('=== Demiurge Starting ===');
    console.log('Hadrian: "I am not the man I was... but I am the man I must be."');
    console.log('');

    // Initialize git repo
    await this.initializeGit();

    this.running = true;
    this.loop();
  }

  private async initializeGit(): Promise<void> {
    const repoPath = this.git.getRepositoryPath();
    
    if (!existsSync(join(repoPath, '.git'))) {
      console.log('Hadrian: Initializing repository...');
      await this.git.init();
      await this.git.configureAuthor(
        this.config.git.authorName,
        this.config.git.authorEmail
      );
      await this.git.addRemote('origin', this.config.git.repoUrl);
    }

    // Try to pull latest
    try {
      console.log('Hadrian: Syncing with origin...');
      await this.git.pull('origin', this.config.git.branch);
    } catch (error) {
      console.log('Hadrian: Could not pull from origin (repo may be empty)');
    }
  }

  private async loop(): Promise<void> {
    while (this.running) {
      try {
        await this.cycle();
      } catch (error) {
        console.error('Hadrian: Error in main loop:', error);
      }

      // Sleep before next iteration
      await this.sleep(this.config.server.loopIntervalMs);
    }
  }

  private async cycle(): Promise<void> {
    console.log(`\n[${new Date().toISOString()}] Hadrian: Beginning cycle...`);

    // 1. Check for new directives
    await this.checkDirectives();

    // 2. Process pending tasks
    await this.processPendingTasks();

    // 3. Log status
    const pendingCount = this.db.getPendingTasks().length;
    console.log(`Hadrian: Cycle complete. ${pendingCount} tasks pending.`);
  }

  private async checkDirectives(): Promise<void> {
    const directivesDir = this.config.storage.directivesDir;
    
    if (!existsSync(directivesDir)) {
      return;
    }

    const files = readdirSync(directivesDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

    for (const file of files) {
      const filePath = join(directivesDir, file);
      const content = readFileSync(filePath, 'utf-8');
      
      try {
        const directive = YAML.parse(content) as Directive;
        
        if (directive.from !== 'The Emperor') {
          console.log(`Hadrian: Ignoring directive ${directive.id} - not from The Emperor`);
          continue;
        }

        console.log(`Hadrian: Received directive from The Emperor: ${directive.task}`);
        
        // Create task from directive
        const agentType = this.selectAgentForTask(directive.task);
        const tier = this.router.selectTier(directive.task, directive.priority as TaskPriority);
        const estimate = this.router.getCostEstimate(tier);
        
        console.log(`Hadrian: Delegating to ${agentType} (Tier ${tier}: ${estimate.provider})`);

        this.db.createTask({
          directive_id: directive.id,
          agent_type: agentType,
          status: 'pending',
          priority: directive.priority as TaskPriority,
          description: directive.task,
          context: directive.context,
        });

      } catch (error) {
        console.error(`Hadrian: Failed to parse directive ${file}:`, error);
      }
    }
  }

  private selectAgentForTask(taskDescription: string): AgentType {
    const desc = taskDescription.toLowerCase();
    
    // Infrastructure tasks
    if (desc.includes('infrastructure') || desc.includes('deploy') || desc.includes('kubernetes') || desc.includes('terraform') || desc.includes('k8s')) {
      return AgentType.LORIAN;
    }
    
    // Research/Analysis tasks
    if (desc.includes('research') || desc.includes('analyze') || desc.includes('document') || desc.includes('review')) {
      return AgentType.VALKA;
    }
    
    // Coordination tasks
    if (desc.includes('coordinate') || desc.includes('summarize') || desc.includes('communicate')) {
      return AgentType.OTAVIA;
    }
    
    // Implementation tasks (default to Palino)
    if (desc.includes('implement') || desc.includes('create') || desc.includes('build') || desc.includes('code') || desc.includes('read') || desc.includes('file') || desc.includes('run command') || desc.includes('execute command')) {
      return AgentType.PALINO;
    }
    
    // Default to Hadrian for complex decisions
    return AgentType.HADRIAN;
  }

  private async processPendingTasks(): Promise<void> {
    const tasks = this.db.getPendingTasks();

    for (const task of tasks) {
      console.log(`Hadrian: Executing task ${task.id} with ${task.agent_type}`);
      
      // Update status to in_progress
      this.db.updateTaskStatus(task.id, 'in_progress');

      try {
        // Get agent and execute
        const agent = createAgent(task.agent_type);
        const response = await agent.executeTask(task);

        // Update task with result
        this.db.updateTaskStatus(
          task.id,
          response.success ? 'completed' : 'failed',
          response.output,
          response.error
        );

        console.log(`Hadrian: Task ${task.id} ${response.success ? 'completed' : 'failed'}`);

      } catch (error) {
        console.error(`Hadrian: Task ${task.id} failed with error:`, error);
        this.db.updateTaskStatus(
          task.id,
          'failed',
          undefined,
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop(): void {
    console.log('\nHadrian: "The burden of command is heavy. I rest."');
    this.running = false;
  }
}

// Start server
const server = new DemiurgeServer();

process.on('SIGINT', () => {
  server.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.stop();
  process.exit(0);
});

server.start().catch(error => {
  console.error('Failed to start Demiurge:', error);
  process.exit(1);
});
