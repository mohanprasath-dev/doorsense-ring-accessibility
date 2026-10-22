# DoorSense: Accessible Ring Alerts That Explain What Happened

> Accessibility-first Ring companion that turns ambiguous doorbell and camera events into clear, calm, visual-first guidance. Built for the **Amazon Developer Hackathon 2026 — Ring Priority Track (Accessibility)**.

---

## 1. Product Summary

DoorSense makes Ring doorbell and camera alerts immediately understandable without requiring sound. It ingests Ring events at runtime, deduplicates rapid bursts, and uses a deterministic, uncertainty-aware rule classifier to present plain-language explanations:
- **Possible delivery**
- **Possible familiar-context match**
- **Person detected, identity unknown**
- **Motion detected, person not confirmed**
- **Unclassified event**

The system never implies certainty about identity, intent, or danger. The deterministic classifier is the absolute source of truth.

---

## 2. Key Accessibility Features

- **Visual-First Default:** Sound is disabled by default. Visual alerts use large, high-contrast typography and clear icons.
- **Color-Independent Status:** Categories are distinguished by text badges, sensory evidence lists, and iconography—never color alone.
- **High-Contrast Theme:** Instant one-click switch to maximum-contrast black mode with high-visibility borders.
- **Keyboard Navigation:** Full Tab/Shift-Tab navigation, visible focus rings (`focus-visible`), and accessible modal controls (`Escape` to close).
- **Screen-Reader Optimized:** Semantic headings and live region updates (`aria-live="polite"`) ensure assistive tech announces new events immediately.
- **Optional Spoken Announcements:** Off by default; can be enabled in settings for users who prefer synthesized speech.

---

## 3. Architecture & Free Tech Stack

```text
Ring simulator / API / device
          │
          ▼
    Ring Adapter ───► Zod Validation ───► NormalizedEvent
                                                │
                                                ▼
                                    Rule Classifier + Deduplicator
                                                │
                          ┌─────────────────────┴─────────────────────┐
                          ▼                                           ▼
                 SQLite Event Store                         Server-Sent Events (SSE)
                          │                                           │
                          └─────────────────────┬─────────────────────┘
                                                ▼
                                       React Accessible UI
```

- **Backend:** Node.js 22 LTS, Fastify, Zod, SQLite (`better-sqlite3`)
- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons
- **Testing:** Vitest (unit & integration tests)
- **Deployment:** 100% free local execution. No Supabase, no paid AI APIs, no credit card required.

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js 22 LTS (or 20+)
- npm

### 1. Install dependencies
```bash
npm install
```

### 2. Run automated test suite
```bash
npm test
```
All unit and integration tests run offline with zero external dependencies.

### 3. Start the application
In terminal 1 (backend server on port 8787):
```bash
npm run dev
```

In terminal 2 (frontend Vite dev server on port 3000):
```bash
npm run dev:client
```

Open `http://localhost:3000` in your browser.

---

## 5. Three-Minute Hackathon Demo Scenarios

The integrated **Ring Runtime Simulator** in the UI allows judges and developers to reproduce the exact runtime flows with one click:

1. **Possible Delivery:** Click *1. Delivery*. Observe package sensor telemetry, higher-confidence card, and low-risk next step (*"Check doorstep or entryway when convenient"*).
2. **Familiar-Context Match:** Click *2. Familiar Context*. Demonstrates cautious wording (*"Identity is not guaranteed"*) based on a scheduled caregiver arrival window.
3. **Ambiguous Visitor / Motion:** Click *3. Ambiguous Motion*. Triggers low-certainty peripheral motion. DoorSense renders *Unclassified event* or *Motion detected, person not confirmed* rather than guessing or labeling a threat.
4. **Rapid Burst Deduplication:** Click *5. Rapid Burst (3×)*. Three rapid motion events in 1 second are grouped into a single card with badge `×3` and timestamp range, preventing alert fatigue.
5. **Provider Failure & Degraded State:** Click *6. Test Degraded Mode*. Displays a prominent provider notice and explains fallback behavior safely.

---

## 6. Scope Guardrails & Safety Guarantees

DoorSense adheres to strict safety principles:
- **No facial recognition or biometric identification.**
- **No threat or danger classification.**
- **No automatic door unlocking or hardware access control.**
- **No emergency dispatch or law enforcement escalation.**
- **No surveillance or covert tracking.**

---

## 7. License

MIT License. See [LICENSE](LICENSE) for details.
