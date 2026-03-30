import { z } from 'zod';

const ConfigSchema = z.object({
  server: z.object({
    port: z.number().default(3000),
    loopIntervalMs: z.number().default(30000),
    healthCheckPort: z.number().default(8080),
  }),
  git: z.object({
    repoUrl: z.string().default('https://github.com/dustyhorizon/demiurge'),
    branch: z.string().default('main'),
    authorName: z.string().default('Hadrian'),
    authorEmail: z.string().default('hadrian@demiurge.local'),
  }),
  github: z.object({
    token: z.string().optional().default(''),
  }),
  llm: z.object({
    opencode: z.object({
      apiKey: z.string().optional(),
      baseUrl: z.string().default('https://api.opencode.ai'),
    }),
    openrouter: z.object({
      apiKey: z.string().optional(),
      baseUrl: z.string().default('https://openrouter.ai/api/v1'),
    }),
    anthropic: z.object({
      apiKey: z.string().optional(),
      baseUrl: z.string().default('https://api.anthropic.com'),
    }),
    ollama: z.object({
      baseUrl: z.string().default('http://ollama:11434'),
      enabled: z.boolean().default(false),
    }),
  }),
  storage: z.object({
    dataDir: z.string().default('.data'),
    databasePath: z.string().default('.data/demiurge.db'),
    workspacesDir: z.string().default('.data/workspaces'),
    directivesDir: z.string().default('directives'),
  }),
  agents: z.object({
    enabled: z.array(z.enum(['hadrian', 'valka', 'palino', 'lorian', 'otavia'])).default(['hadrian']),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

let configCache: Config | null = null;

export function loadConfig(): Config {
  if (configCache) {
    return configCache;
  }

  const config = ConfigSchema.parse({
    server: {
      port: parseInt(process.env.DEMIURGE_PORT || '3000'),
      loopIntervalMs: parseInt(process.env.DEMIURGE_LOOP_INTERVAL_MS || '30000'),
      healthCheckPort: parseInt(process.env.DEMIURGE_HEALTH_PORT || '8080'),
    },
    git: {
      repoUrl: process.env.DEMIURGE_REPO_URL,
      branch: process.env.DEMIURGE_BRANCH,
      authorName: process.env.DEMIURGE_GIT_AUTHOR_NAME,
      authorEmail: process.env.DEMIURGE_GIT_AUTHOR_EMAIL,
    },
    github: {
      token: process.env.DEMIURGE_GITHUB_TOKEN,
    },
    llm: {
      opencode: {
        apiKey: process.env.DEMIURGE_OPENCODE_API_KEY,
        baseUrl: process.env.DEMIURGE_OPENCODE_BASE_URL,
      },
      openrouter: {
        apiKey: process.env.DEMIURGE_OPENROUTER_API_KEY,
        baseUrl: process.env.DEMIURGE_OPENROUTER_BASE_URL,
      },
      anthropic: {
        apiKey: process.env.DEMIURGE_ANTHROPIC_API_KEY,
        baseUrl: process.env.DEMIURGE_ANTHROPIC_BASE_URL,
      },
      ollama: {
        baseUrl: process.env.DEMIURGE_OLLAMA_BASE_URL,
        enabled: process.env.DEMIURGE_OLLAMA_ENABLED === 'true',
      },
    },
    storage: {
      dataDir: process.env.DEMIURGE_DATA_DIR,
      databasePath: process.env.DEMIURGE_DATABASE_PATH,
      workspacesDir: process.env.DEMIURGE_WORKSPACES_DIR,
      directivesDir: process.env.DEMIURGE_DIRECTIVES_DIR,
    },
    agents: {
      enabled: process.env.DEMIURGE_ENABLED_AGENTS?.split(',') as Array<'hadrian' | 'valka' | 'palino' | 'lorian' | 'otavia'>,
    },
  });

  configCache = config;
  return config;
}

export function getConfig(): Config {
  if (!configCache) {
    return loadConfig();
  }
  return configCache;
}

export function clearConfigCache(): void {
  configCache = null;
}

export { ConfigSchema };
