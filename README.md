# Gemini Vector Frontend

**Vector — Real-Time Logistics Autopilot**

An AI-driven travel recovery system with real-time observability, built with Next.js, Three.js, and Gemini Live.

---

## Tech Stack

| Layer           | Technology                                        |
| --------------- | ------------------------------------------------- |
| Framework       | Next.js 16 (App Router)                           |
| Language        | TypeScript (strict)                               |
| Styling         | Tailwind CSS + iOS 26 Liquid UI tokens            |
| 3D / WebGL      | Three.js + @react-three/fiber + @react-three/drei |
| Post-processing | @react-three/postprocessing (Bloom)               |
| State           | Zustand                                           |
| Animation       | Framer Motion                                     |
| Icons           | Lucide React                                      |
| Real-time       | WebSocket (VectorWebSocket client)                |
| Audio           | Web Audio API + AudioWorklet                      |

---

## Features

- **4-zone layout** — StatusBanner / AgentLogPanel / TravelMap / DecisionCard / PulseVisualizer
- **Live agent state orb** — Idle → Listening → Thinking → Searching → Proposing → Speaking → Executing (red flash)
- **Route recovery proposals** — confirm or reject via voice or UI, sent over WebSocket
- **`route_updated` events** — real-time alternative route display on the map
- **VoiceControls** — microphone toggle with audio level metering + barge-in interrupt
- **Error toast** — animated reconnect / error surface
- **Mobile responsive** — stacked single-column layout on small screens
- **iOS 26 Liquid UI** — glassmorphism panels, spring animations, frosted blur

---

## Getting Started

### Prerequisites

- Node.js 20+
- Backend running on `http://localhost:8080` (WebSocket at `ws://localhost:8080/ws`)

### Install

```bash
npm install
```

### Environment

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

### Run

```bash
npm run dev      # development (webpack)
npm run build    # production build
npm run start    # production server
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout, favicon, metadata
│   ├── page.tsx            # Main 4-zone app shell
│   └── providers.tsx       # React Query + global providers
├── components/
│   ├── AgentLogPanel.tsx   # Left panel — agent event log
│   ├── BargeInButton.tsx   # Interrupt button (Speaking/Executing states)
│   ├── DecisionCard.tsx    # Right panel — recovery proposals
│   ├── PulseVisualizer.tsx # Three.js cognitive state orb
│   ├── StatusBanner.tsx    # Top bar — flight status + WS connection
│   ├── ThreeBackground.tsx # Full-screen starfield + nebula
│   ├── TravelMap.tsx       # SVG animated route map
│   └── VoiceControls.tsx   # Mic toggle + barge-in
├── hooks/
│   ├── useAgentEvents.ts   # WebSocket → Zustand store bridge
│   ├── useGeminiLive.ts    # Gemini Live audio streaming
│   └── useMicrophone.ts    # Low-level mic + AnalyserNode
├── services/
│   ├── audioStream.ts      # PCM audio streaming service
│   ├── eventParser.ts      # Raw WS event → ParsedEvent
│   └── websocketClient.ts  # VectorWebSocket with auto-reconnect
├── store/
│   └── travelStore.ts      # Zustand global state
├── types/
│   └── travelTypes.ts      # All shared TypeScript interfaces
└── workers/
    └── audioProcessor.ts   # AudioWorklet off-thread PCM processor
```

---

## WebSocket Events

| Event                 | Direction       | Description                   |
| --------------------- | --------------- | ----------------------------- |
| `agent_state_changed` | Server → Client | Updates agent cognitive state |
| `log_entry`           | Server → Client | Appends to agent log panel    |
| `proposal_created`    | Server → Client | New recovery proposal         |
| `route_updated`       | Server → Client | Alternative route data        |
| `booking_confirmed`   | Server → Client | Booking confirmation          |
| `confirm_proposal`    | Client → Server | User confirms proposal        |
| `reject_proposal`     | Client → Server | User rejects proposal         |
| `authenticate`        | Client → Server | Auth handshake on connect     |

---

## License

MIT
