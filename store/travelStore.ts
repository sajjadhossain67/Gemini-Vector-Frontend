import { create } from "zustand";
import type {
  AgentState,
  AgentLog,
  Flight,
  SuggestedOption,
  TravelState,
  UserLocation,
  RouteUpdate,
} from "@/types/travelTypes";

interface TravelStore extends TravelState {
  setAgentState: (state: AgentState) => void;
  setAudioLevel: (level: number) => void;
  setConnected: (connected: boolean) => void;
  addLog: (message: string, type?: AgentLog["type"]) => void;
  setFlight: (flight: Flight | null) => void;
  setFlightStatus: (status: string) => void;
  setUserLocation: (loc: UserLocation) => void;
  setSuggestedOptions: (opts: SuggestedOption[]) => void;
  setActiveProposal: (opt: SuggestedOption | null) => void;
  setSelectedOption: (opt: SuggestedOption | null) => void;
  setBookingStatus: (status: TravelState["bookingStatus"]) => void;
  setTrafficETA: (eta: number | null) => void;
  setSuggestedRoute: (route: RouteUpdate | null) => void;
  setErrorMessage: (msg: string | null) => void;
  // WS sender — injected by useAgentEvents hook
  _wsSend: ((data: unknown) => void) | null;
  _setWsSend: (fn: ((data: unknown) => void) | null) => void;
  confirmProposal: () => void;
  rejectProposal: () => void;
  startDemo: () => void;
}

const MOCK_FLIGHT: Flight = {
  id: "BA148",
  flightNumber: "BA148",
  airline: "British Airways",
  departure: {
    airport: "London Heathrow",
    airportCode: "LHR",
    time: "18:30",
    gate: "A22",
    terminal: "T5",
  },
  arrival: {
    airport: "New York JFK",
    airportCode: "JFK",
    time: "21:45",
    gate: "B14",
    terminal: "T7",
  },
  status: "Delayed",
  delay: 45,
};

const MOCK_PROPOSAL: SuggestedOption = {
  id: "opt-1",
  type: "flight",
  title: "Alternative Flight Found",
  departure: "20:00",
  airport: "London Heathrow",
  airportCode: "LHR",
  price: 212,
  etaImpact: 15,
  details: {
    Flight: "VS025",
    Airline: "Virgin Atlantic",
    Terminal: "T2",
    Gate: "C31",
    Duration: "7h 45m",
    Class: "Economy",
    Seats: "4 available",
  },
  score: 94,
};

let demoTimer: ReturnType<typeof setTimeout> | null = null;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export const useTravelStore = create<TravelStore>((set, get) => ({
  userLocation: {
    lat: 51.477928,
    lng: -0.001545,
    address: "London Heathrow Airport",
    label: "LHR",
  },
  currentFlight: null,
  flightStatus: "Monitoring",
  trafficETA: null,
  agentState: "Idle",
  suggestedOptions: [],
  selectedOption: null,
  bookingStatus: "idle",
  agentLogs: [],
  audioLevel: 0,
  isConnected: false,
  activeProposal: null,
  suggestedRoute: null,
  errorMessage: null,
  _wsSend: null,

  setSuggestedRoute: (route) => set({ suggestedRoute: route }),
  setErrorMessage: (msg) => set({ errorMessage: msg }),
  _setWsSend: (fn) => set({ _wsSend: fn }),

  setAgentState: (state) => set({ agentState: state }),
  setAudioLevel: (level) => set({ audioLevel: level }),
  setConnected: (connected) => set({ isConnected: connected }),
  setFlight: (flight) => set({ currentFlight: flight }),
  setFlightStatus: (status) => set({ flightStatus: status }),
  setUserLocation: (loc) => set({ userLocation: loc }),
  setSuggestedOptions: (opts) => set({ suggestedOptions: opts }),
  setActiveProposal: (opt) => set({ activeProposal: opt }),
  setSelectedOption: (opt) => set({ selectedOption: opt }),
  setBookingStatus: (status) => set({ bookingStatus: status }),
  setTrafficETA: (eta) => set({ trafficETA: eta }),

  addLog: (message, type = "info") =>
    set((state) => ({
      agentLogs: [
        ...state.agentLogs.slice(-49),
        { id: uid(), timestamp: new Date(), message, type },
      ],
    })),

  confirmProposal: () => {
    const {
      activeProposal,
      addLog,
      setBookingStatus,
      setAgentState,
      setActiveProposal,
      _wsSend,
    } = get();
    if (!activeProposal) return;
    // Optimistic UI — immediately show "Booking in progress"
    setBookingStatus("pending");
    setAgentState("Executing");
    addLog("Booking confirmation initiated...", "action");
    addLog(
      `Processing payment for ${activeProposal.airport} at $${activeProposal.price}`,
      "info",
    );
    // Send WS event per spec §5
    _wsSend?.({ type: "confirm_proposal", proposalId: activeProposal.id });
    setTimeout(() => {
      setBookingStatus("confirmed");
      setAgentState("Speaking");
      addLog("✓ Booking confirmed — VS025 at 20:00", "success");
      addLog("Sending confirmation to your email", "info");
      setTimeout(() => {
        setActiveProposal(null);
        setAgentState("Listening");
      }, 3000);
    }, 2000);
  },

  rejectProposal: () => {
    const {
      setActiveProposal,
      setAgentState,
      addLog,
      activeProposal,
      _wsSend,
    } = get();
    // Send WS event per spec §5
    _wsSend?.({ type: "reject_proposal", proposalId: activeProposal?.id });
    setActiveProposal(null);
    setAgentState("Searching");
    addLog("Searching for more alternatives...", "info");
    setTimeout(() => {
      setAgentState("Listening");
      addLog("Awaiting instructions", "info");
    }, 2000);
  },

  startDemo: () => {
    if (demoTimer) clearTimeout(demoTimer);
    const {
      addLog,
      setAgentState,
      setFlight,
      setFlightStatus,
      setConnected,
      setTrafficETA,
      setActiveProposal,
    } = get();

    const schedule = (fn: () => void, ms: number) => {
      demoTimer = setTimeout(fn, ms);
    };

    let t = 0;
    const step = (fn: () => void, delay: number) => {
      t += delay;
      schedule(fn, t);
    };

    setConnected(true);
    setAgentState("Listening");
    addLog("Vector AI system online", "success");
    addLog("Establishing secure connection...", "info");

    step(() => {
      addLog("Connected — monitoring travel logistics", "success");
      setFlight(MOCK_FLIGHT);
      setFlightStatus("Monitoring BA148");
    }, 800);

    step(() => {
      setAgentState("Thinking");
      addLog("⚠ Delay detected: BA148 — 45 minutes", "warning");
      setFlightStatus("DELAYED +45min");
    }, 1200);

    step(() => {
      setTrafficETA(92);
      addLog("Traffic analysis: 92 min to T2 via M25", "info");
    }, 1000);

    step(() => {
      setAgentState("Searching");
      addLog("Scanning alternative flights from LHR & LGW...", "action");
    }, 900);

    step(() => {
      addLog("Checking connections: LHR T2, T3, T5", "info");
    }, 800);

    step(() => {
      addLog("Analyzing traffic to Gatwick (via A23)", "info");
    }, 700);

    step(() => {
      addLog("Cross-referencing seat availability...", "info");
    }, 900);

    step(() => {
      setAgentState("Proposing");
      addLog(
        "Found 3 viable alternatives — best match scored 94/100",
        "success",
      );
      setSuggestedOptions([MOCK_PROPOSAL]);
      setActiveProposal(MOCK_PROPOSAL);
    }, 1000);

    step(() => {
      setAgentState("Speaking");
      addLog("Presenting recommendation to user", "action");
    }, 800);

    function setSuggestedOptions(opts: SuggestedOption[]) {
      set({ suggestedOptions: opts });
    }
  },
}));
