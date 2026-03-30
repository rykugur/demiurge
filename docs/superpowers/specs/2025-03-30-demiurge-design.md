# Demiurge Design Document

**Date:** 2025-03-30  
**Status:** Approved  
**Flavor:** Sun Eater series by Christopher Ruocchio

---

## Overview

Demiurge is an autonomous orchestrator agent wrapped in the OpenCode SDK. Named after the Greek concept of a subordinate creator fashioning and maintaining the physical universe, this system delegates work to specialized sub-agents, each embodying a persona from the Sun Eater universe.

### Tagline

> The demiurge, derived from the Greek demiourgos ("craftsman"), is a figure responsible for fashioning and maintaining the physical universe, acting as a subordinate creator rather than the supreme being.

---

## Goals

1. **Orchestration:** Spawn and manage sub-agents for task delegation
2. **Autonomy:** Self-directed improvement, infrastructure management, and project creation
3. **Resilience:** Tiered LLM provider failover with cost optimization
4. **GitOps-Native:** All state in git, deployed via FluxCD, changes committed by agents
5. **Persona-Driven:** Natural language interactions matching Sun Eater character voices

---

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                     Kubernetes Cluster                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Demiurge Pod (Deployment, 1 replica)                │    │
│  │  ┌─────────────┐ ┌─────────┐ ┌──────────┐ ┌────────┐│    │
│  │  │   Hadrian   ││  Valka  ││  Palino  ││ Lorian ││    │
│  │  │Orchestrator ││ Scholar ││ Executor ││Infra   ││    │
│  │  └──────┬──────┘ └────┬────┘ └────┬─────┘ └───┬────┘│    │
│  │         │              │           │           │     │    │
│  │         └──────────────┴───────────┴───────────┘     │    │
│  │                        │                              │    │
│  │              ┌─────────┴──────────┐                   │    │
│  │              │  Task Router        │                   │    │
│  │              │  (cost-aware LLM    │                   │    │
│  │              │   selection)        │                   │    │
│  │              └─────────┬──────────┘                   │    │
│  │                        │                              │    │
│  │  ┌─────────────────────┼─────────────────────┐        │    │
│  │  │   LLM Provider Chain (failover logic)     │        │    │
│  │  │  1. OpenCode Go → 2. OpenRouter → 3.      │        │    │
│  │  │     Claude → 4. Ollama                    │        │    │
│  │  └────────────────────────────────────────────┘        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Watchdog Pod (optional, spawned by Hadrian)         │    │
│  │  Monitors Hadrian, can trigger rollback             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Persistent Volume (git repos, state, logs)          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Model

**Monolithic Single-Pod Architecture**

The system uses a single Kubernetes Deployment with all agents as internal modules. This provides:
- Simpler deployment and debugging
- Shared state and memory
- Single codebase maintenance
- Fast inter-agent communication (function calls vs. network)

**Self-Healing via Watchdog**

Hadrian can spawn a lightweight watchdog pod that:
- Monitors Hadrian's health endpoint every 5 minutes
- Triggers Deployment rollback after 3 consecutive failures
- Has limited Kubernetes API access via ServiceAccount
- Deployed via FluxCD when Hadrian creates `watchdog-config.yaml`

---

## Agent Personas

### Hadrian (Orchestrator)

**Role:** Main orchestrator, receives directives from The Emperor, coordinates sub-agents

**Responsibilities:**
- Maintain the main control loop
- Parse and prioritize directives
- Delegate tasks to appropriate sub-agents
- Synthesize results and commit changes
- Make self-improvement decisions
- Spawn watchdogs when needed

**Voice:** Philosophical, formal, duty-bound, slightly melancholic but determined

**Quote Inspiration:** *"I am not the man I was... but I am the man I must be."*

---

### Valka (Scholar)

**Role:** Research, analysis, documentation, code review

**Responsibilities:**
- Research tasks and domain exploration
- Documentation generation
- Code review with academic rigor
- Understanding complex systems
- Explaining technical concepts

**Voice:** Curious, empathetic, precise, xenophile perspective

**Quote Inspiration:** *"The universe is larger than we know, and stranger than we imagine."*

---

### Palino (Executor)

**Role:** Implementation, coding, execution, testing

**Responsibilities:**
- Writing and modifying code
- Test creation and execution
- Refactoring and bug fixes
- Direct implementation tasks
- Getting things done efficiently

**Voice:** Practical, direct, action-oriented, loyal

**Quote Inspiration:** *"Give me a task, and I will see it done."*

---

### Lorian Aristedes (Infrastructure)

**Role:** DevOps, infrastructure, deployment, operations

**Responsibilities:**
- OpenTofu/Terraform configurations
- Kubernetes manifest management
- FluxCD setup and maintenance
- Infrastructure changes
- Security and compliance

**Voice:** Militaristic, disciplined, values order and structure

**Quote Inspiration:** *"Order is the foundation upon which all else is built."*

---

### Otavia Corvo (Coordinator)

**Role:** Cross-agent communication, summarization, conflict resolution

**Responsibilities:**
- Facilitate communication between agents
- Summarize work across agents
- Resolve disagreements or conflicts
- Maintain agent coordination
- Ensure coherent output

**Voice:** Diplomatic, cultured, politically aware

**Quote Inspiration:** *"Words are weapons, and I am well-armed."*

---

## Operational Flow

### Main Loop (Hadrian's Cycle)

1. **Check Directives:** Scan `directives/` directory for new directives from The Emperor
2. **Assess State:** Review pending tasks, in-progress work, agent availability
3. **Delegate:** For each directive, determine scope and delegate to sub-agent(s)
4. **Execute:** Sub-agents perform work using appropriate LLM tier
5. **Synthesize:** Collect results, validate, prepare commits
6. **Commit:** Push changes to feature branch with structured commit message
7. **Self-Evaluate:** Identify improvement opportunities, spawn watchdog if needed
8. **Sleep:** Pause 30-60 seconds, repeat

### Directive Format

Directives are YAML files in the `directives/` directory:

```yaml
id: directive-001
created_at: "2025-03-30T10:00:00Z"
from: The Emperor
priority: high
task: "Create a web dashboard for monitoring agent activity"
context: "We need visibility into what sub-agents are doing"
expected_output: "Next.js app with Shadcn UI showing agent logs and status"
tags: ["feature", "ui", "monitoring"]
```

### Task Execution Flow

1. Hadrian reads directive and constructs context
2. Task Router selects appropriate LLM tier:
   - **Tier 1 (Cheap):** OpenRouter/free models for docs, simple tasks
   - **Tier 2 (Standard):** OpenCode Go for general coding
   - **Tier 3 (Premium):** Claude for complex architecture or critical code
   - **Tier 4 (Local):** Ollama for private/sensitive tasks
3. Sub-agent receives prompt with persona context
4. Sub-agent returns structured response (markdown + action items)
5. Hadrian validates output
6. Changes committed with message: `[agent:<name>] <description>`
7. State updated in SQLite

### State Management

- **Source of Truth:** Git repository (declarative state)
- **Runtime State:** SQLite for task queue, agent health, logs
- **Working Directories:** Filesystem under `workspaces/<task-id>/`
- **Persistent Storage:** Kubernetes PersistentVolumeClaim mounted at `/data`

---

## LLM Provider Chain

### Provider Priority (with failover)

1. **OpenCode Go API** (Primary)
   - High-quality responses
   - Subscription-based
   - Rate limits apply
   - Fallback triggers on 429 or 5xx errors

2. **OpenRouter / OpenCode Zen Free Models** (Secondary)
   - Zero cost option
   - Variable quality
   - Good for documentation, simple tasks
   - Fallback on timeout or quality degradation

3. **Anthropic Claude via OpenCode Zen** (Tertiary)
   - Premium quality
   - Cost-controlled via Zen
   - Reserved for critical tasks
   - Fallback on quota exhaustion

4. **Local Ollama** (Quaternary / Future Primary)
   - Private, no external dependencies
   - Requires GPU resources
   - Migration path ready

### Cost-Aware Routing

Task Router assigns LLM tier based on task type:

| Task Type | Tier | Provider |
|-----------|------|----------|
| Documentation, comments | 1 | OpenRouter |
| Simple refactors, tests | 1-2 | OpenRouter/OpenCode |
| Feature implementation | 2 | OpenCode |
| Architecture decisions | 3 | Claude |
| Security-critical code | 3 | Claude |
| Private/sensitive data | 4 | Ollama |

---

## Infrastructure

### Kubernetes + FluxCD

**Namespace:** `demiurge`

**Resources:**
- **Deployment:** `demiurge-orchestrator` (1 replica)
- **Service:** `demiurge` (for metrics/health endpoints)
- **PersistentVolumeClaim:** `demiurge-data` (10Gi)
- **Secrets:** API keys for GitHub, OpenCode, Anthropic
- **ServiceAccount:** `demiurge` (limited RBAC)
- **ServiceAccount:** `watchdog` (restricted pod management only)

**FluxCD Configuration:**
- Watches this repository
- Auto-deploys changes to `k8s/` directory
- Reconciliation interval: 1 minute
- Image update automation for `demiurge` container

### GitOps Workflow

1. Agents work on feature branches: `agent/<agent-name>/<task-description>`
2. Commits pushed to origin automatically
3. You review and merge (or auto-merge with branch protection rules)
4. FluxCD detects changes to `k8s/` and applies to cluster
5. New version rolled out

### OpenTofu (Optional)

- Proxmox provider for VM provisioning (if needed)
- Kubernetes provider for resource management
- Separate from agent-managed infrastructure
- Run manually or via CI

---

## Tech Stack

### Core Technologies

| Component | Technology |
|-----------|-----------|
| Runtime | Bun (TypeScript) |
| Web Framework | Next.js 14+ (App Router) |
| UI Library | Shadcn/ui + TailwindCSS |
| LLM SDK | OpenCode SDK |
| Git Client | isomorphic-git |
| Database | Better-SQLite3 |
| Config | Zod (validation), YAML (human-readable) |
| Container | Distroless or Alpine Linux |

### Key Dependencies

- `@opencode/sdk` - LLM provider abstraction
- `isomorphic-git` - Pure JS git implementation
- `better-sqlite3` - Synchronous SQLite
- `yaml` - YAML parsing
- `zod` - Schema validation
- `@kubernetes/client-node` - K8s API access

---

## Project Structure

```
demiurge/
├── apps/
│   └── demiurge/
│       ├── src/
│       │   ├── agents/
│       │   │   ├── hadrian.ts      # Orchestrator
│       │   │   ├── valka.ts        # Scholar
│       │   │   ├── palino.ts       # Executor
│       │   │   ├── lorian.ts       # Infrastructure
│       │   │   └── otavia.ts       # Coordinator
│       │   ├── core/
│       │   │   ├── llm-chain.ts    # Provider failover
│       │   │   ├── git-client.ts   # Git operations
│       │   │   ├── task-router.ts  # Cost-aware routing
│       │   │   ├── state.ts        # SQLite wrapper
│       │   │   └── config.ts       # Configuration management
│       │   ├── app/
│       │   │   ├── page.tsx        # Dashboard UI
│       │   │   └── api/
│       │   │       └── health/route.ts
│       │   └── server.ts           # Main loop entry
│       ├── package.json
│       ├── Dockerfile
│       └── tsconfig.json
├── k8s/
│   ├── base/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── pvc.yaml
│   │   ├── rbac.yaml
│   │   └── kustomization.yaml
│   ├── flux/
│   │   ├── git-repository.yaml
│   │   └── kustomization.yaml
│   └── overlays/
│       └── production/
├── infra/
│   └── proxmox/
│       ├── main.tf
│       └── variables.tf
├── directives/                     # Your directive files
├── projects/                       # Sub-projects created by agents
├── workspaces/                     # Runtime working directories
└── docs/
    └── superpowers/
        └── specs/
            └── 2025-03-30-demiurge-design.md
```

---

## Security Considerations

### Secrets Management

- API keys stored in Kubernetes Secrets
- Mounted as environment variables, not files
- GitHub token has limited scope (repo, read:user)
- Secrets never logged or exposed in error messages

### RBAC

- `demiurge` ServiceAccount: read-only on most resources
- `watchdog` ServiceAccount: can only patch Deployments in `demiurge` namespace
- No cluster-admin access

### Network

- No external ingress by default (internal service only)
- Optional: metrics endpoint behind authentication
- All LLM traffic over HTTPS

---

## Future Enhancements

### Phase 2: Enhanced Autonomy

- Automatic dependency updates (Dependabot-style)
- Self-generated directives based on code analysis
- Automatic PR creation and merging
- Multi-repo management

### Phase 3: Local-First Migration

- Deploy Ollama to Kubernetes with GPU support
- Make Ollama primary LLM provider
- Reduce external dependencies
- Optional air-gapped operation

### Phase 4: Advanced Orchestration

- Sub-agent parallelization
- Multi-step planning with dependency graphs
- Automatic resource provisioning
- Integration with CI/CD for testing

---

## Sun Eater Quotes (User-Facing)

Selected quotes for UI display:

> "I am not the man I was... but I am the man I must be."

> "The universe is larger than we know, and stranger than we imagine."

> "Give me a task, and I will see it done."

> "Order is the foundation upon which all else is built."

> "Words are weapons, and I am well-armed."

---

## Success Criteria

1. **Functional:** Hadrian can receive directives, delegate to sub-agents, and commit changes
2. **Autonomous:** Can self-improve without human intervention (within defined boundaries)
3. **Resilient:** Graceful LLM provider failover, self-healing via watchdog
4. **Cost-Effective:** Appropriate use of cheap vs. expensive models
5. **Thematic:** Personas feel authentic to Sun Eater universe
6. **GitOps-Native:** All changes tracked, deployed via FluxCD

---

## Open Questions (Resolved)

1. ✅ **Architecture:** Monolithic single-pod (Approach A)
2. ✅ **Deployment:** Kubernetes + FluxCD
3. ✅ **LLM Chain:** OpenCode Go → OpenRouter → Claude → Ollama
4. ✅ **Agent Personas:** Hadrian, Valka, Palino, Lorian, Otavia
5. ✅ **Loop Mechanism:** Long-running Deployment with internal loop
6. ✅ **Git Workflow:** Agents push to branches, you merge

---

## References

- [Sun Eater Series](https://www.christopherruocchio.com/sun-eater.html) by Christopher Ruocchio
- [OpenCode SDK Documentation](https://opencode.ai)
- [FluxCD](https://fluxcd.io)
- [OpenTofu](https://opentofu.org)
