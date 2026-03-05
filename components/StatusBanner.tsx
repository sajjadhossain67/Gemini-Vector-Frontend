"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Wifi,
  WifiOff,
  Plane,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useTravelStore } from "@/store/travelStore";

const STATUS_COLORS: Record<string, string> = {
  "On Time": "#30D158",
  DELAYED: "#FFD60A",
  Cancelled: "#FF3B30",
  Boarding: "#00D4FF",
  Monitoring: "#636366",
};

export default function StatusBanner() {
  const isConnected = useTravelStore((s) => s.isConnected);
  const flight = useTravelStore((s) => s.currentFlight);
  const flightStatus = useTravelStore((s) => s.flightStatus);
  const trafficETA = useTravelStore((s) => s.trafficETA);
  const agentState = useTravelStore((s) => s.agentState);
  const bookingStatus = useTravelStore((s) => s.bookingStatus);

  const statusColor = flight?.status?.includes("Delayed")
    ? STATUS_COLORS.DELAYED
    : (STATUS_COLORS[flight?.status ?? ""] ?? STATUS_COLORS.Monitoring);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* Shimmer line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="flex items-center justify-between px-5 py-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,122,255,0.15), rgba(0,212,255,0.1))",
                boxShadow: "0 0 16px rgba(0,212,255,0.4)",
              }}
            >
              <Image
                src="/vector.png"
                alt="Vector"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute -inset-1 rounded-xl bg-ios-blue-glow/20 blur-md -z-10" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">
              VECTOR
            </div>
            <div className="text-[10px] text-white/40 tracking-widest uppercase">
              Logistics Autopilot
            </div>
          </div>
        </div>

        {/* Flight info */}
        <AnimatePresence mode="wait">
          {flight ? (
            <motion.div
              key="flight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-6"
            >
              <div className="flex items-center gap-2">
                <Plane size={14} className="text-white/50" />
                <span className="text-sm font-semibold text-white">
                  {flight.flightNumber}
                </span>
                <span className="text-white/30">·</span>
                <span className="text-xs text-white/60">{flight.airline}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/50">
                <span className="font-mono">
                  {flight.departure.airportCode}
                </span>
                <span className="text-white/20">→</span>
                <span className="font-mono">{flight.arrival.airportCode}</span>
              </div>

              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  color: statusColor,
                  background: `${statusColor}20`,
                  border: `1px solid ${statusColor}40`,
                  boxShadow: `0 0 12px ${statusColor}25`,
                }}
              >
                {flight.delay && flight.delay > 0 ? (
                  <AlertTriangle size={11} />
                ) : (
                  <CheckCircle2 size={11} />
                )}
                {flight.delay && flight.delay > 0
                  ? `DELAYED +${flight.delay}min`
                  : flight.status}
              </div>

              {trafficETA && (
                <div className="flex items-center gap-1.5 text-xs text-white/50">
                  <Clock size={12} />
                  <span>{trafficETA}min to airport</span>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-white/30 italic"
            >
              Awaiting travel context...
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status indicators */}
        <div className="flex items-center gap-3">
          {bookingStatus === "confirmed" && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-ios-green"
              style={{
                background: "rgba(48,209,88,0.15)",
                border: "1px solid rgba(48,209,88,0.3)",
                boxShadow: "0 0 12px rgba(48,209,88,0.2)",
              }}
            >
              <CheckCircle2 size={12} />
              Booking Confirmed
            </motion.div>
          )}

          <div className="flex items-center gap-1.5 text-xs">
            {isConnected ? (
              <>
                <div
                  className="w-1.5 h-1.5 rounded-full bg-ios-green animate-glow-pulse"
                  style={{ boxShadow: "0 0 6px #30D158" }}
                />
                <Wifi size={13} className="text-ios-green" />
                <span className="text-white/40">Live</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-ios-yellow animate-pulse" />
                <WifiOff size={13} className="text-white/40" />
                <span className="text-white/30">Demo</span>
              </>
            )}
          </div>

          <div
            className="px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-wider"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            {agentState.toUpperCase()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
