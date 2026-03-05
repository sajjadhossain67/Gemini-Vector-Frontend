"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ChevronRight } from "lucide-react";
import { useTravelStore } from "@/store/travelStore";
import type { AgentLog } from "@/types/travelTypes";

const LOG_COLORS: Record<
  AgentLog["type"],
  { color: string; bg: string; dot: string }
> = {
  info: { color: "rgba(255,255,255,0.55)", bg: "transparent", dot: "#636366" },
  warning: { color: "#FFD60A", bg: "rgba(255,214,10,0.06)", dot: "#FFD60A" },
  success: { color: "#30D158", bg: "rgba(48,209,88,0.06)", dot: "#30D158" },
  error: { color: "#FF3B30", bg: "rgba(255,59,48,0.06)", dot: "#FF3B30" },
  action: { color: "#00D4FF", bg: "rgba(0,212,255,0.06)", dot: "#00D4FF" },
};

function LogEntry({ log, index }: { log: AgentLog; index: number }) {
  const styles = LOG_COLORS[log.type];
  const time = log.timestamp.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <motion.div
      initial={{ x: -16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.25, delay: index < 3 ? index * 0.04 : 0 }}
      className="flex items-start gap-2.5 px-3 py-2 rounded-xl group"
      style={{ background: styles.bg }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full mt-[5px] flex-shrink-0"
        style={{
          backgroundColor: styles.dot,
          boxShadow: `0 0 6px ${styles.dot}80`,
        }}
      />
      <div className="flex-1 min-w-0">
        <div
          className="text-[11px] leading-relaxed break-words"
          style={{ color: styles.color }}
        >
          {log.message}
        </div>
      </div>
      <div className="text-[10px] text-white/20 font-mono flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {time}
      </div>
    </motion.div>
  );
}

export default function AgentLogPanel() {
  const logs = useTravelStore((s) => s.agentLogs);
  const agentState = useTravelStore((s) => s.agentState);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={13} className="text-white/40" />
          <span className="text-xs font-semibold text-white/50 tracking-wider uppercase">
            Agent Reasoning
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{
              backgroundColor: agentState === "Idle" ? "#636366" : "#30D158",
              boxShadow: agentState === "Idle" ? "none" : "0 0 6px #30D158",
            }}
          />
          <span className="text-[10px] text-white/30">
            {logs.length} events
          </span>
        </div>
      </div>

      {/* Log stream */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-0.5 pr-1 mask-bottom">
        <AnimatePresence initial={false}>
          {logs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full gap-3 text-center"
            >
              <div
                className="w-8 h-8 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <ChevronRight size={16} className="text-white/20" />
              </div>
              <p className="text-xs text-white/20">Awaiting agent events...</p>
            </motion.div>
          ) : (
            logs.map((log, i) => (
              <LogEntry key={log.id} log={log} index={logs.length - 1 - i} />
            ))
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
