# Demiurge

> _The demiurge, derived from the Greek demiourgos ("craftsman"), is a figure responsible for fashioning and maintaining the physical universe, acting as a subordinate creator rather than the supreme being._

An autonomous orchestrator agent system inspired by Christopher Ruocchio's Sun Eater series.

## Agents

| Agent | Role | Quote |
|-------|------|-------|
| **Hadrian** | Orchestrator | "I am not the man I was... but I am the man I must be." |
| **Valka** | Scholar | "The universe is larger than we know, and stranger than we imagine." |
| **Palino** | Executor | "Give me a task, and I will see it done." |
| **Lorian** | Infrastructure | "Order is the foundation upon which all else is built." |
| **Otavia** | Coordinator | "Words are weapons, and I am well-armed." |

## Quick Start

### Local Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Start development server
bun run dev

# Start the agent loop
bun run server
```

### Kubernetes Deployment

```bash
# Create namespace and apply manifests
kubectl create namespace demiurge
kubectl apply -k k8s/base

# Or with FluxCD (recommended)
# See k8s/flux/ for Flux configuration
```

### Sending Directives

Create a YAML file in `directives/`:

```yaml
id: directive-001
created_at: "2025-03-30T10:00:00Z"
from: The Emperor
priority: high
task: "Create a new feature"
context: "Additional context"
expected_output: "What should be produced"
tags: ["feature"]
```

## Configuration

Set via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DEMIURGE_GITHUB_TOKEN` | GitHub personal access token | Required |
| `DEMIURGE_OPENCODE_API_KEY` | OpenCode API key | - |
| `DEMIURGE_REPO_URL` | Target git repository | - |
| `DEMIURGE_LOOP_INTERVAL_MS` | Main loop interval | 30000 |

See `apps/demiurge/src/core/config.ts` for full configuration options.

## Architecture

- **Monolithic** TypeScript/Bun application
- **SQLite** for runtime state
- **isomorphic-git** for repository operations
- **Tiered LLM provider chain** (OpenCode → OpenRouter → Claude → Ollama)
- **Kubernetes** deployment with **FluxCD** GitOps
- **Self-healing** via optional watchdog

## License

MIT
