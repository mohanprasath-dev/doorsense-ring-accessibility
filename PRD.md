# Product Requirements Document: DoorSense

## 1. Product summary

DoorSense is an accessibility-first Ring companion. It receives Ring doorbell and camera events, groups related events, and presents clear visual-first guidance such as “Possible delivery,” “Possible familiar contact,” or “Unclassified visitor.” It is designed for deaf and hard-of-hearing users, older adults, and people who benefit from low-stress, plain-language alerts.

The product communicates uncertainty explicitly. A rule-based classifier is the source of truth. Optional natural-language wording must never invent facts or convert weak evidence into certainty.

## 2. Hackathon positioning

- **Event:** Build, Ship, Shape: Amazon Developer Hackathon 2026
- **Primary track:** Ring
- **Priority category:** Accessibility
- **Optional mini challenge:** AWS Builder only if a working AWS runtime integration is later added and documented
- **Required proof:** Ring API, SDK, simulator, or device is called at runtime and shown in the demo

## 3. Problem

Many home alerts are audio-first, ambiguous, repetitive, and cognitively demanding. A raw “motion detected” notification does not tell a user what happened, whether it is related to an earlier event, or what low-risk next step is available. People who cannot reliably hear an alert may miss it entirely.

## 4. Goals

1. Make Ring events understandable without sound.
2. Reduce alert fatigue through grouping and deduplication.
3. Use cautious language when evidence is incomplete.
4. Demonstrate real Ring runtime integration through the supported simulator or API.
5. Deliver a polished, reproducible demo within a hackathon timeline.
6. Keep the core stack free to run locally and deployable on free tiers.

## 5. Non-goals

- Facial recognition or sensitive-attribute inference.
- Declaring a person safe, dangerous, criminal, or definitely known.
- Unlocking doors or controlling access hardware.
- Calling emergency services or making emergency determinations.
- Replacing Ring’s official security controls.
- Building a general-purpose chatbot.

## 6. Target users

- Deaf or hard-of-hearing residents.
- Older adults who prefer large, plain-language alerts.
- Residents who want visual context instead of repeated raw notifications.
- Caregivers who need a calmer event summary, subject to consent and privacy controls.

## 7. MVP user stories

- As a user, I can see a large visual alert when a Ring event arrives.
- As a user, I can understand why an event was classified as a possible delivery, familiar-context match, motion-only event, or unclassified visitor.
- As a user, I can distinguish urgency without relying on color or sound.
- As a user, I can see related repeated events grouped into one timeline item.
- As a user, I can use the application with keyboard navigation and a screen reader.
- As a judge, I can reproduce three scenarios from a clean setup using the Ring simulator or supported API path.

## 8. Functional requirements

### 8.1 Event ingestion

- Receive supported Ring events at runtime.
- Normalize source payloads into a typed internal event schema.
- Preserve source, timestamp, event type, and stable event identifier when available.
- Handle duplicates, missing fields, delayed events, invalid payloads, and unavailable integration states.

### 8.2 Interpretation

Allowed categories:

- Possible delivery
- Possible familiar-context match
- Person detected, identity unknown
- Motion detected, person not confirmed
- Unclassified event

Every interpretation contains a category, confidence band (`higher`, `limited`, or `unknown`), explanation, timestamp, and low-risk next action. The system must prefer “unclassified” when evidence is insufficient.

### 8.3 Accessibility UI

- Large readable cards and responsive layout.
- High-contrast light and dark themes.
- Color-independent status using text and icons.
- Keyboard navigation and visible focus.
- Semantic headings and screen-reader labels.
- Visual-only mode with sound disabled.
- Optional spoken announcement, off by default.
- Event history and settings for notification preferences.

### 8.4 Safety and privacy

- Never expose secrets in the client bundle or repository.
- Retain only the minimum event metadata needed for the demo.
- Show degraded-state messages when Ring is unavailable.
- Never imply that an event is proof of identity or intent.
- Keep any trusted-contact feature local, explicit, and opt-in.

## 9. Demo acceptance criteria

The following must work from a clean checkout:

1. Ring simulator/API path produces an event visible in the app.
2. Possible delivery scenario renders a clear visual alert.
3. Familiar-context scenario renders cautious wording and evidence.
4. Ambiguous visitor scenario renders “Unclassified” rather than a threat label.
5. Repeated events are grouped or deduplicated.
6. Ring failure state is visible and safe.
7. Automated tests cover parsing, classification, deduplication, and malformed input.
8. Accessibility checks report no critical violations.
9. README commands reproduce the demo without undocumented steps.

## 10. Success metrics for the hackathon

- Judge can understand the product within 15 seconds.
- Ring runtime proof appears before the halfway point of the video.
- Three scenarios complete without manual code edits.
- No unsafe or unsupported claim appears in UI or narration.
- A new developer can run the project by following the README.

## 11. Risks and mitigations

- **Ring credential or simulator friction:** maintain a recorded fixture mode for automated tests, while reserving the final demo for real supported Ring runtime events.
- **Network failure:** show explicit offline/degraded state; keep deterministic classifier local.
- **Classifier overconfidence:** use fixed categories and evidence-based wording.
- **Scope creep:** defer Alexa, advanced AI, and multi-device orchestration until the MVP passes.
- **Accessibility regressions:** run axe-core and keyboard checks on every UI change.
