"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, MapPin, Clock, Plane, AlertCircle } from "lucide-react";
import { useTravelStore } from "@/store/travelStore";

// Animated route path using SVG
function RouteMap({ hasAlternative }: { hasAlternative: boolean }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setOffset((o) => (o + 1) % 200), 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[180px]">
      <svg
        viewBox="0 0 320 200"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 0 8px rgba(0,122,255,0.3))" }}
      >
        {/* Background grid */}
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="0.5"
            />
          </pattern>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,122,255,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <rect width="320" height="200" fill="url(#grid)" rx="12" />
        <rect width="320" height="200" fill="url(#mapGlow)" rx="12" />

        {/* Original delayed route */}
        <path
          d="M 40 100 C 100 80 180 70 280 90"
          fill="none"
          stroke="rgba(255,214,10,0.25)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />

        {/* Alternative route — animated */}
        {hasAlternative && (
          <>
            <path
              id="altRoute"
              d="M 40 100 C 80 130 180 140 280 110"
              fill="none"
              stroke="rgba(0,212,255,0.15)"
              strokeWidth="2"
            />
            <path
              d="M 40 100 C 80 130 180 140 280 110"
              fill="none"
              stroke="rgba(0,212,255,0.7)"
              strokeWidth="2"
              strokeDasharray="12 200"
              strokeDashoffset={-offset}
              style={{ filter: "drop-shadow(0 0 4px rgba(0,212,255,0.8))" }}
            />
          </>
        )}

        {/* Current route — main */}
        <path
          id="mainRoute"
          d="M 40 100 C 100 80 180 70 280 90"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2.5"
        />
        <path
          d="M 40 100 C 100 80 180 70 280 90"
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="2.5"
          strokeDasharray="8 200"
          strokeDashoffset={-offset * 1.2}
        />

        {/* Origin — LHR */}
        <circle
          cx="40"
          cy="100"
          r="6"
          fill="rgba(0,122,255,0.9)"
          style={{ filter: "drop-shadow(0 0 6px #007AFF)" }}
        />
        <circle
          cx="40"
          cy="100"
          r="10"
          fill="none"
          stroke="rgba(0,122,255,0.3)"
          strokeWidth="1.5"
        >
          <animate
            attributeName="r"
            values="6;14;6"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0;0.3"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <text
          x="40"
          y="88"
          textAnchor="middle"
          fill="rgba(255,255,255,0.7)"
          fontSize="9"
          fontWeight="600"
        >
          LHR
        </text>

        {/* Destination — JFK */}
        <circle
          cx="280"
          cy="90"
          r="5"
          fill="rgba(48,209,88,0.9)"
          style={{ filter: "drop-shadow(0 0 6px #30D158)" }}
        />
        <text
          x="280"
          y="78"
          textAnchor="middle"
          fill="rgba(255,255,255,0.7)"
          fontSize="9"
          fontWeight="600"
        >
          JFK
        </text>

        {/* Alternative airport marker */}
        {hasAlternative && (
          <>
            <circle
              cx="280"
              cy="110"
              r="4"
              fill="rgba(0,212,255,0.7)"
              style={{ filter: "drop-shadow(0 0 5px #00D4FF)" }}
            />
            <text
              x="295"
              y="114"
              fill="rgba(0,212,255,0.8)"
              fontSize="8"
              fontWeight="600"
            >
              ALT
            </text>
          </>
        )}

        {/* Traffic indicator */}
        <circle cx="140" cy="82" r="3" fill="rgba(255,214,10,0.8)">
          <animate
            attributeName="opacity"
            values="0.8;0.3;0.8"
            dur="1.2s"
            repeatCount="indefinite"
          />
        </circle>
        <text
          x="140"
          y="72"
          textAnchor="middle"
          fill="rgba(255,214,10,0.6)"
          fontSize="7"
        >
          Traffic
        </text>
      </svg>
    </div>
  );
}

export default function TravelMap() {
  const flight = useTravelStore((s) => s.currentFlight);
  const userLocation = useTravelStore((s) => s.userLocation);
  const trafficETA = useTravelStore((s) => s.trafficETA);
  const activeProposal = useTravelStore((s) => s.activeProposal);
  const suggestedRoute = useTravelStore((s) => s.suggestedRoute);
  const agentState = useTravelStore((s) => s.agentState);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Navigation size={13} className="text-white/40" />
          <span className="text-xs font-semibold text-white/50 tracking-wider uppercase">
            Live Map
          </span>
        </div>
        <AnimatePresence>
          {agentState === "Searching" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] text-ios-purple animate-pulse"
              style={{ color: "#BF5AF2" }}
            >
              Scanning routes...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map */}
      <div
        className="flex-1 rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,10,30,0.8), rgba(0,5,20,0.9))",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <RouteMap hasAlternative={!!(activeProposal || suggestedRoute)} />
      </div>

      {/* Info chips */}
      <div className="flex flex-col gap-2 flex-shrink-0">
        {userLocation && (
          <div className="flex items-center gap-2 text-xs text-white/45">
            <MapPin
              size={11}
              className="text-ios-blue flex-shrink-0"
              style={{ color: "#007AFF" }}
            />
            <span className="truncate">
              {userLocation.address ?? userLocation.label}
            </span>
          </div>
        )}

        {trafficETA && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{
              background: "rgba(255,214,10,0.08)",
              border: "1px solid rgba(255,214,10,0.15)",
            }}
          >
            <Clock size={11} style={{ color: "#FFD60A" }} />
            <span style={{ color: "#FFD60A" }}>
              {trafficETA} min via M25 — heavy traffic
            </span>
          </div>
        )}

        {flight && (
          <div className="flex items-center justify-between text-[11px] text-white/35">
            <div className="flex items-center gap-1.5">
              <Plane size={10} />
              <span className="font-mono">
                {flight.departure.airportCode} T
                {flight.departure.terminal?.slice(-1) ?? "5"} Gate{" "}
                {flight.departure.gate}
              </span>
            </div>
            {flight.delay && flight.delay > 0 && (
              <div
                className="flex items-center gap-1 text-ios-yellow"
                style={{ color: "#FFD60A" }}
              >
                <AlertCircle size={10} />
                <span>+{flight.delay}min</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
