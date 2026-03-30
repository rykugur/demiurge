# Demiurge - Project Context for Claude

**Project:** Demiurge - Autonomous Orchestrator Agent System  
**Flavor:** Sun Eater series by Christopher Ruocchio  
**User:** Known as "The Emperor"  

---

## Project Overview

Demiurge is an autonomous agent system that receives directives from The Emperor (the user), delegates work to specialized sub-agents, and self-improves over time. Each agent embodies a persona from the Sun Eater book series.

## The Agents

| Agent | Role | Quote | Best For |
|-------|------|-------|----------|
| **Hadrian** | Orchestrator | "I am not the man I was... but I am the man I must be." | Task delegation, strategic decisions, overall coordination |
| **Valka** | Scholar | "The universe is larger than we know, and stranger than we imagine." | Research, analysis, documentation, design systems |
| **Palino** | Executor | "Give me a task, and I will see it done." | Implementation, coding, execution, getting things built |
| **Lorian** | Infrastructure | "Order is the foundation upon which all else is built." | DevOps, Kubernetes, Terraform, security |
| **Otavia** | Coordinator | "Words are weapons, and I am well-armed." | Communication, summarization, cross-agent coordination |

## Agent Collaboration Patterns

### Research + Implementation (Valka + Palino)
For tasks requiring both analysis and coding:
1. Valka researches/analyzes and creates documentation
2. Palino implements based on Valka's guidance
3. Example: Frontend design systems, architecture decisions

### Infrastructure + Security (Lorian)
For DevOps and infrastructure tasks:
1. Lorian handles all K8s, Terraform, deployment
2. Security-focused by default

### Coordination (Otavia)
For multi-agent tasks:
1. Otavia facilitates communication
2. Summarizes work across agents
3. Resolves conflicts

## Technology Stack

- **Runtime:** Bun (TypeScript)
- **Framework:** Next.js 14 with App Router
- **UI:** Shadcn/ui + TailwindCSS
- **State:** SQLite (better-sqlite3)
- **Git:** isomorphic-git (pure JS)
- **LLM Chain:** OpenCode Go → OpenRouter → Claude → Ollama
- **Deployment:** Kubernetes + FluxCD GitOps

## Project Structure

```
demiurge/
├── apps/demiurge/          # Main application
│   ├── src/
│   │   ├── agents/         # Agent implementations
│   │   ├── core/           # Core modules (types, config, db, etc.)
│   │   ├── app/            # Next.js app directory
│   │   └── server.ts       # Main orchestrator entry point
│   └── tests/              # Test files
├── k8s/                    # Kubernetes manifests
├── docs/superpowers/       # Design docs and plans
└── STATUS.md              # Current project status
```

## Sending Directives

Create YAML files in `directives/` directory:

```yaml
id: directive-001
created_at: "2025-03-30T10:00:00Z"
from: The Emperor
priority: high
task: "Create a web dashboard for monitoring"
context: "We need visibility into agent activity"
expected_output: "Next.js app with agent status cards"
tags: ["feature", "ui"]
```

## Conventions

### Code Style
- Use TypeScript with strict mode
- Follow existing patterns in the codebase
- Write tests using `bun:test`
- Use Zod for validation
- Prefer explicit types over `any`

### Commit Messages
- `feat:` for new features
- `fix:` for bug fixes
- `test:` for test additions
- `docs:` for documentation
- `chore:` for maintenance

### Agent Persona
When speaking as/with agents:
- Use formal, slightly archaic language
- Reference their quotes when appropriate
- Maintain their character traits
- Show dedication to duty

## Important Notes

- **Worktrees:** Use `.worktrees/` for isolated feature work
- **Tests:** Run with `bun test` (SQLite tests require Docker)
- **Native Modules:** better-sqlite3 needs rebuild in Docker
- **LLM Providers:** Currently using mock implementations (Phase 2)
- **Skills:** Phase 2 will add external skill integration

## Current Status

**Phase 1:** ✅ Complete (Core system implemented)
**Phase 2:** 🔄 Planning (Skills integration, local-first migration)

See `STATUS.md` for detailed status and Phase 2 plans.

## Preferences

- Prefer explicit over implicit
- Test-driven development (TDD) for core modules
- Subagent-driven development for complex features
- Frequent small commits over large ones
- Documentation in code (JSDoc) and in `docs/`
- Sun Eater quotes in user-facing applications (flavorful but minimal)

## Blockers & Decisions

None currently. All Phase 1 decisions finalized and implemented.

---

**For The Emperor:** When working on this project, consider which agent persona would best handle the task. Complex tasks often benefit from agent collaboration (e.g., Valka for design research, Palino for implementation).
