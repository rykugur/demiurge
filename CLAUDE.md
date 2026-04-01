# CLAUDE.md - Assistant Context

**Project:** Demiurge - Autonomous Orchestrator Agent System  
**User:** Known as "The Emperor"

---

## Workflow Requirements

### Git Operations Require Confirmation
**ALWAYS ask The Emperor before committing or pushing code.**
- Present the diff and commit message for approval
- Wait for explicit confirmation (e.g., "yes", "commit it", "push")
- Never commit/push without permission
- Exception: Emergency fixes may be committed with explanation

## Code Conventions

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

## Preferences

- Prefer explicit over implicit
- Test-driven development (TDD) for core modules
- Subagent-driven development for complex features
- Frequent small commits over large ones
- Documentation in code (JSDoc) and in `docs/`
- Sun Eater quotes in user-facing applications (flavorful but minimal)

## Important Notes

- **Worktrees:** Use `.worktrees/` for isolated feature work
- **Tests:** Run with `bun test` (SQLite tests require Docker)
- **Native Modules:** better-sqlite3 needs rebuild in Docker
- **LLM Providers:** Currently using mock implementations (Phase 2)
- **Skills:** Phase 2 will add external skill integration

## Technology Stack

- **Runtime:** Bun (TypeScript)
- **Framework:** Next.js 14 with App Router
- **UI:** Shadcn/ui + TailwindCSS
- **State:** SQLite (better-sqlite3) / bun:sqlite
- **Git:** isomorphic-git (pure JS)
- **LLM Chain:** OpenCode Go → OpenRouter → Claude → Ollama
- **Deployment:** Kubernetes + FluxCD GitOps
- **Infrastructure:** OpenTofu + Talos Linux + Proxmox

## Project Structure

```
demiurge/
├── apps/demiurge/          # Main application
├── infra/                  # OpenTofu infrastructure
├── clusters/               # FluxCD GitOps configs
├── k8s/                    # Kubernetes manifests
└── docs/                   # Documentation
```

## Current Status

**Phase 1:** ✅ Complete (Core system implemented)  
**Phase 2:** 🔄 Planning (Skills integration, infrastructure automation)

See `STATUS.md` for detailed status.

---

**For Agents:** See `AGENTS.md` for agent-specific context and personas.
