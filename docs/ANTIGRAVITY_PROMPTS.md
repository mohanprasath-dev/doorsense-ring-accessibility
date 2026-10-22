# Antigravity Prompt Library

Use these prompts as separate tasks. Require an artifact and test result after each one.

## 1. Kickoff and repository audit

```text
You are the planner for DoorSense, an accessibility-first Ring companion for the Amazon App Dev 2026 Ring Track.

Inspect the repository and official integration path. Do not edit code yet. Return:
1. current architecture and entry points;
2. whether Ring is actually called at runtime;
3. missing setup, secrets, and simulator steps;
4. accessibility and safety risks;
5. a five-milestone plan with the smallest viable demo;
6. files you expect to change.

The base stack must be completely free to run locally and must not use Supabase or paid AI APIs. Keep the product deterministic and safe.
```

## 2. Ring runtime integration

```text
Implement the smallest supported Ring simulator/API runtime integration for DoorSense.

Requirements:
- Use the official supported Ring method already selected in the repository.
- Normalize supported doorbell, motion, person, and package-related events.
- Preserve timestamp, event type, source, and stable ID when available.
- Handle missing fields, duplicates, delayed events, rate limits, invalid payloads, and unavailable credentials.
- Add tests with clearly labeled fixtures.
- Add exact simulator/API setup instructions to the README.

Do not create a fake Ring integration for the final demo. Run tests and produce an artifact showing one real supported event entering the application.
```

## 3. Conservative interpretation engine

```text
Implement a typed, deterministic DoorSense interpretation layer.

Allowed labels:
- Possible delivery
- Possible familiar-context match
- Person detected, identity unknown
- Motion detected, person not confirmed
- Unclassified event

Return category, confidence band, evidence, timestamp, and a low-risk next action. Prefer Unclassified when evidence is insufficient. Never infer sensitive traits, identity certainty, criminality, danger, or emergency status. Add tests for normal, ambiguous, duplicate, delayed, and malformed events.
```

## 4. Accessibility-first UI

```text
Implement the DoorSense UI for fast, silent comprehension.

Include large readable event cards, high contrast, color-independent status, semantic headings, screen-reader labels, keyboard navigation, visible focus, visual-only mode, optional spoken announcements off by default, event history, and notification settings.

Run browser tests and axe-core. Capture screenshots for delivery, familiar-context, unclassified, and degraded states. Fix all critical accessibility violations before reporting completion.
```

## 5. Free deployment packaging

```text
Package DoorSense for a free local-first deployment.

Preferred options:
- local Node/TypeScript server for the judging source of truth;
- optional Cloudflare Pages for static frontend hosting;
- optional Cloudflare Workers/D1 for a small backend and event history;
- GitHub for repository, issues, and CI.

No Supabase, no paid API, no credit card, and no hidden hosted dependency. Keep Ring secrets server-side. Add .env.example and a clean-checkout verification script.
```

## 6. Security and privacy review

```text
Review DoorSense for leaked secrets, overbroad permissions, unsafe event text, prompt injection, identity overclaiming, accidental access control, emergency escalation, excessive retention, and provider failure behavior. Return findings by severity, fix critical/high findings, and add regression tests. Do not add surveillance features.
```

## 7. End-to-end verification

```text
From a clean environment, verify these scenarios using the supported Ring simulator/API:
1. possible delivery;
2. possible familiar-context match;
3. unclassified visitor;
4. duplicate event grouping;
5. Ring/provider failure.

Capture simulator action, normalized event, UI output, and fallback behavior. Produce screenshots or a walkthrough artifact. Report and fix flaky steps. The final flow must be repeatable by a developer who did not build the app.
```

## 8. Judge simulation

```text
Act as an Amazon hackathon judge using Tech Implementation, Design, Potential Impact, and Quality of the Idea. Score each from 1–10 using concrete repository/demo evidence. Identify the largest weakness and one feasible fix. Verify that the first 15 seconds explain the user, Ring event, and accessibility benefit, and that the video visibly proves Ring runtime use.
```

## 9. Release gate

```text
Prepare the repository for submission. Verify license, README, setup, environment template, tests, accessibility evidence, Ring runtime proof, demo script, product feedback notes, and safety limitations. Run from a clean checkout. Do not claim a tool, API, or feature that was not actually tested.
```
