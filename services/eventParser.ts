import type {
  WebSocketEvent,
  AgentState,
  SuggestedOption,
  AgentLog,
  RouteUpdate,
} from "@/types/travelTypes";

export interface ParsedEvent {
  kind:
    | "agent_state"
    | "log"
    | "proposal"
    | "route"
    | "booking"
    | "audio"
    | "unknown";
  data: unknown;
}

export function parseEvent(raw: WebSocketEvent): ParsedEvent {
  switch (raw.type) {
    case "agent_state": {
      const payload = raw.payload as { state: AgentState };
      return { kind: "agent_state", data: payload.state };
    }
    case "agent_log": {
      const payload = raw.payload as {
        message: string;
        level?: AgentLog["type"];
      };
      return { kind: "log", data: payload };
    }
    case "proposal_created":
    case "proposal_updated": {
      const payload = raw.payload as SuggestedOption;
      return { kind: "proposal", data: payload };
    }
    case "route_updated": {
      const payload = raw.payload as RouteUpdate;
      return { kind: "route", data: payload };
    }
    case "booking_status": {
      const payload = raw.payload as { status: string };
      return { kind: "booking", data: payload };
    }
    case "speech_audio": {
      return { kind: "audio", data: raw.payload };
    }
    default:
      return { kind: "unknown", data: raw.payload };
  }
}
