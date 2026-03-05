"use client";

import { useTravelStore } from "@/store/travelStore";

export function useTravelState() {
  return useTravelStore((s) => ({
    userLocation: s.userLocation,
    currentFlight: s.currentFlight,
    flightStatus: s.flightStatus,
    trafficETA: s.trafficETA,
    agentState: s.agentState,
    suggestedOptions: s.suggestedOptions,
    selectedOption: s.selectedOption,
    bookingStatus: s.bookingStatus,
    activeProposal: s.activeProposal,
    isConnected: s.isConnected,
  }));
}
