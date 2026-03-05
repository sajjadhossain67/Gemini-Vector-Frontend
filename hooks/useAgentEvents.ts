"use client";

import { useEffect, useRef } from "react";
import { useTravelStore } from "@/store/travelStore";
import { VectorWebSocket } from "@/services/websocketClient";
import { parseEvent } from "@/services/eventParser";
import type {
  AgentState,
  SuggestedOption,
  RouteUpdate,
} from "@/types/travelTypes";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws";

export function useAgentEvents() {
  const wsRef = useRef<VectorWebSocket | null>(null);
  const {
    setAgentState,
    addLog,
    setActiveProposal,
    setBookingStatus,
    setConnected,
    setSuggestedRoute,
    setErrorMessage,
    _setWsSend,
  } = useTravelStore();

  useEffect(() => {
    const ws = new VectorWebSocket(WS_URL);
    wsRef.current = ws;

    const removeEvent = ws.onEvent((raw) => {
      const parsed = parseEvent(raw);
      switch (parsed.kind) {
        case "agent_state":
          setAgentState(parsed.data as AgentState);
          break;
        case "log": {
          const d = parsed.data as {
            message: string;
            level?: "info" | "warning" | "success" | "error" | "action";
          };
          addLog(d.message, d.level ?? "info");
          break;
        }
        case "proposal":
          setActiveProposal(parsed.data as SuggestedOption);
          break;
        case "route":
          setSuggestedRoute(parsed.data as RouteUpdate);
          break;
        case "booking": {
          const d = parsed.data as { status: string };
          setBookingStatus(
            d.status as "idle" | "pending" | "confirmed" | "failed",
          );
          break;
        }
      }
    });

    const removeStatus = ws.onStatus((connected) => {
      setConnected(connected);
      if (connected) {
        addLog("WebSocket connected", "success");
        setErrorMessage(null);
      } else {
        addLog("WebSocket disconnected — retrying...", "warning");
        setErrorMessage("Reconnecting to agent...");
      }
    });

    // Attempt connection (will silently fail/retry if no server in demo mode)
    try {
      ws.connect();
    } catch {
      // demo mode — no backend
    }

    // Inject WS send function into store so confirmProposal/rejectProposal can use it
    _setWsSend((data) => ws.send(data));

    return () => {
      removeEvent();
      removeStatus();
      _setWsSend(null);
      ws.disconnect();
    };
  }, [
    setAgentState,
    addLog,
    setActiveProposal,
    setBookingStatus,
    setConnected,
    setSuggestedRoute,
    setErrorMessage,
    _setWsSend,
  ]);

  const interrupt = () => {
    wsRef.current?.send({ type: "interrupt_agent" });
    addLog("Interrupt signal sent to agent", "action");
  };

  return { interrupt, send: (data: unknown) => wsRef.current?.send(data) };
}
