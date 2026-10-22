# AGENTS.md — DoorSense

## Mission

Build a demo-ready Ring accessibility application. Optimize for a reliable, understandable, safe three-minute demo—not feature count.

## Required behavior

1. Inspect the repository before editing.
2. Make a plan before multi-file changes.
3. Work in small milestones and run tests after each milestone.
4. Produce reviewable artifacts: plan, diff, test output, screenshots, or browser walkthrough.
5. Preserve the real Ring runtime integration. Never replace it with a fake integration in the final path.
6. Keep fixtures clearly labeled as test-only.
7. Keep the deterministic event classifier as the source of truth.
8. Use “possible,” “context match,” and “unclassified” language. Never claim identity, intent, danger, or emergency certainty.
9. Ask for human review before destructive changes, adding credentials, or changing provider architecture.
10. Do not commit secrets, tokens, real Ring payloads containing unnecessary personal data, or private recordings.

## Scope guardrails

Do not implement facial recognition, sensitive-attribute inference, automatic door unlocking, emergency dispatch, law-enforcement escalation, or covert monitoring. Do not add Supabase. Do not add a paid API to the base project.

## Preferred workflow

- `planner`: inspect requirements and propose the smallest milestone.
- `ring-integrator`: implement and test the supported Ring runtime path.
- `classifier`: implement typed normalization, conservative rules, and deduplication.
- `accessibility`: implement semantic, keyboard-first, high-contrast UI.
- `qa`: run unit, integration, browser, and accessibility checks.
- `security-reviewer`: inspect secrets, permissions, unsafe assumptions, and failure behavior.
- `release-manager`: validate README, demo path, repository cleanliness, and submission evidence.

Use separate branches/worktrees when parallel changes can conflict. Integrate only after tests pass.

## Definition of done

- Runtime Ring event appears in the interface.
- Three demo scenarios work from a clean environment.
- Tests cover event parsing, classification, deduplication, malformed input, and provider failure.
- Accessibility checks pass for critical issues.
- README has exact setup and run commands.
- No unsupported product claims remain.
- Final diff is small enough for a judge to understand.

## Response format for agents

After each task, report:

- What changed.
- Files changed.
- Commands run and results.
- Artifacts produced.
- Known limitations.
- One recommended next step.
