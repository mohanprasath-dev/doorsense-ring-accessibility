# Submission Plan

## Repository metadata

- **Name:** `doorsense-ring-accessibility`
- **Description:** Accessibility-first Ring companion that turns ambiguous doorbell and camera events into clear, calm, visual-first guidance.
- **Primary track:** Ring
- **Category emphasis:** Accessibility
- **Mini challenge:** None in the completely free base build. Enter AWS Builder only if a real AWS integration is added and documented.

## Required submission assets

- Working project.
- Public GitHub repository with an open-source license, or private repository shared exactly as Devpost requires.
- README with setup, run, test, Ring integration, limitations, and demo steps.
- Public English demo video under three minutes.
- Project description.
- Track and mini-challenge selections.
- Product feedback for every Amazon/API/SDK/tool used.
- Existing-project disclosure if any code predates the hackathon window.

## Evidence to capture

- Ring simulator/API/device event visible at runtime.
- Source file where the Ring integration is imported and called.
- Three UI scenarios: possible delivery, familiar-context match, unclassified visitor.
- Duplicate-event grouping.
- Visual-only accessibility mode.
- Failure state when Ring is unavailable.
- Test output and accessibility scan.
- Clean-checkout run.

## Three-minute narrative

1. Problem and audience in 15 seconds.
2. Ring event source in the first 35 seconds.
3. Delivery and familiar-context scenarios.
4. Ambiguous event handled conservatively.
5. Accessibility and deduplication proof.
6. Brief architecture and free-stack explanation.
7. Close with customer impact.

## Product feedback template

For each tool:

- Used for:
- Worked well:
- Friction:
- Onboarding:
- Would build with it again? Why:
- Concrete feature request:

## Why this can succeed

- Ring explicitly prioritizes accessibility, so the category fit is direct.
- The customer story is understandable without technical explanation.
- The application does more than relay an alert: it clarifies, groups, and communicates uncertainty.
- The free local-first stack lowers demo failure risk.
- Runtime Ring proof satisfies the hardest eligibility requirement.
- Conservative safety design avoids objections about surveillance, identity claims, or unsafe automation.
- Automated tests, accessibility checks, and clean setup make the implementation credible.
- The demo is visually legible and can show value quickly.

No plan guarantees a win. This plan improves the factors the published criteria control: technical implementation, coherent design, credible impact, and originality.
