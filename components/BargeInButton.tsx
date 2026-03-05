"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MicOff } from "lucide-react";
import { useTravelStore } from "@/store/travelStore";

export default function BargeInButton() {
  const [pressed, setPressed] = useState(false);
  const agentState = useTravelStore((s) => s.agentState);
  const setAgentState = useTravelStore((s) => s.setAgentState);
  const addLog = useTravelStore((s) => s.addLog);
  const isActive =
    agentState === "Speaking" ||
    agentState === "Proposing" ||
    agentState === "Executing";

  function handleInterrupt() {
    if (!isActive) return;
    setPressed(true);
    addLog("User interrupted — stopping agent", "warning");
    setAgentState("Listening");
    setTimeout(() => setPressed(false), 600);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        whileHover={isActive ? { scale: 1.06 } : {}}
        whileTap={isActive ? { scale: 0.93 } : {}}
        onClick={handleInterrupt}
        className="relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: isActive
            ? "linear-gradient(135deg, rgba(255,59,48,0.25), rgba(255,59,48,0.12))"
            : "rgba(255,255,255,0.04)",
          border: isActive
            ? "1.5px solid rgba(255,59,48,0.45)"
            : "1.5px solid rgba(255,255,255,0.08)",
          boxShadow: isActive
            ? "0 0 24px rgba(255,59,48,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
          cursor: isActive ? "pointer" : "default",
        }}
      >
        {/* Pulse rings when active */}
        <AnimatePresence>
          {isActive && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-red-500/30"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2.2 + i * 0.4, opacity: 0 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.55,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Icon */}
        <MicOff
          size={18}
          style={{
            color: isActive ? "#FF3B30" : "rgba(255,255,255,0.2)",
            filter: isActive
              ? "drop-shadow(0 0 6px rgba(255,59,48,0.6))"
              : "none",
          }}
        />

        {/* Press flash */}
        <AnimatePresence>
          {pressed && (
            <motion.div
              initial={{ opacity: 0.6, scale: 0.8 }}
              animate={{ opacity: 0, scale: 2 }}
              exit={{}}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-full bg-red-500/30"
            />
          )}
        </AnimatePresence>
      </motion.button>

      <span
        className="text-[10px] font-medium tracking-wider uppercase"
        style={{
          color: isActive ? "rgba(255,59,48,0.8)" : "rgba(255,255,255,0.18)",
        }}
      >
        {isActive ? "Barge In" : "Standby"}
      </span>
    </div>
  );
}
