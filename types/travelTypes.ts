export type AgentState =
  | "Idle"
  | "Listening"
  | "Thinking"
  | "Searching"
  | "Proposing"
  | "Executing"
  | "Speaking";

export interface UserLocation {
  lat: number;
  lng: number;
  address?: string;
  label?: string;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  departure: {
    airport: string;
    airportCode: string;
    time: string;
    gate?: string;
    terminal?: string;
  };
  arrival: {
    airport: string;
    airportCode: string;
    time: string;
    gate?: string;
    terminal?: string;
  };
  status: "On Time" | "Delayed" | "Cancelled" | "Boarding" | "Departed";
  delay?: number;
}

export interface SuggestedOption {
  id: string;
  type: "flight" | "route" | "hotel";
  title: string;
  departure?: string;
  airport?: string;
  airportCode?: string;
  price?: number;
  etaImpact?: number;
  details: Record<string, string>;
  score?: number;
}

export interface AgentLog {
  id: string;
  timestamp: Date;
  message: string;
  type: "info" | "warning" | "success" | "error" | "action";
}

export interface TravelState {
  userLocation: UserLocation | null;
  currentFlight: Flight | null;
  flightStatus: string;
  trafficETA: number | null;
  agentState: AgentState;
  suggestedOptions: SuggestedOption[];
  selectedOption: SuggestedOption | null;
  bookingStatus: "idle" | "pending" | "confirmed" | "failed";
  agentLogs: AgentLog[];
  audioLevel: number;
  isConnected: boolean;
  activeProposal: SuggestedOption | null;
  suggestedRoute: RouteUpdate | null;
  errorMessage: string | null;
}

export interface RouteUpdate {
  origin: { lat: number; lng: number; label: string };
  destination: { lat: number; lng: number; label: string };
  waypoints?: { lat: number; lng: number }[];
  durationMinutes: number;
  distanceKm: number;
  trafficLevel: "low" | "moderate" | "heavy";
}

export interface WebSocketEvent {
  type:
    | "agent_state"
    | "agent_log"
    | "proposal_created"
    | "proposal_updated"
    | "route_updated"
    | "booking_status"
    | "speech_audio";
  payload: unknown;
}

export interface AudioChunk {
  data: Float32Array;
  timestamp: number;
}
