# DoorSense Architecture

```text
Ring simulator/API/device
          |
          v
Ring adapter -> Zod validation -> NormalizedEvent
                                      |
                                      v
                          Rule classifier + deduplicator
                                      |
                    +-----------------+-----------------+
                    |                                   |
                    v                                   v
             SQLite event store                    WebSocket/SSE
                    |                                   |
                    +-----------------+-----------------+
                                      v
                              React accessible UI
```

## Components

### Ring adapter

A server-side module owns Ring credentials and calls the supported Ring integration. It converts provider payloads to an internal schema. The browser never receives provider secrets.

### Normalized event

Suggested fields:

```ts
 type NormalizedEvent = {
   id: string;
   source: "ring";
   sourceEventId?: string;
   type: "doorbell" | "motion" | "person" | "package" | "unknown";
   occurredAt: string;
   location?: string;
   metadata: Record<string, string | number | boolean>;
 };
```

Do not copy unnecessary personal data into `metadata`.

### Classifier

Rules use only available event types, explicit local context, and temporal grouping. They produce a fixed category, confidence band, evidence list, and safe next action. They do not identify people or infer intent.

### Deduplicator

Events of the same type and location within a short configured interval are grouped. The UI shows the group count and latest timestamp instead of repeating identical alerts.

### UI

The main screen is a glanceable timeline. Each card includes category text, a non-color status indicator, reason, timestamp, and next action. A settings screen controls visual-only mode and optional voice announcements.

## Deployment modes

1. **Local demo:** Node server + SQLite + Vite frontend. Recommended.
2. **Static preview:** React frontend on Cloudflare Pages with a demo-fixture mode clearly labeled as non-Ring test data.
3. **Optional hosted integration:** Cloudflare Worker + D1 only after local runtime proof is complete. Never hide the local path.
