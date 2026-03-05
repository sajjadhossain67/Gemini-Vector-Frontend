"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, AlertCircle } from "lucide-react";
import { useTravelStore } from "@/store/travelStore";
import { useMicrophone } from "@/hooks/useMicrophone";
import BargeInButton from "./BargeInButton";

export default function VoiceControls() {
  const agentState = useTravelStore((s) => s.agentState);
  const setAgentState = useTravelStore((s) => s.setAgentState);
  const setAudioLevel = useTravelStore((s) => s.setAudioLevel);
  const addLog = useTravelStore((s) => s.addLog);
  const setErrorMessage = useTravelStore((s) => s.setErrorMessage);

  const onChunk = useCallback((_pcm: Float32Array) => {
    // In production this would stream to WebSocket
  }, []);

  const { isRecording, audioLevel, error, startRecording, stopRecording } =
    useMicrophone(onChunk);

  async function toggleMic() {
    if (isRecording) {
      stopRecording();
      setAudioLevel(0);
      setAgentState("Idle");
      addLog("Microphone stopped", "info");
      setErrorMessage(null);
    } else {
      setErrorMessage(null);
      try {
        await startRecording();
        setAgentState("Listening");
        addLog("Microphone active — listening for voice input", "success");
      } catch {
        setErrorMessage(
          "Microphone access required — check browser permissions",
        );
        addLog("Microphone access denied", "error");
      }
    }
  }

  // Mirror audio level into global store
  useEffect(() => {
    if (isRecording && audioLevel > 0) setAudioLevel(audioLevel);
  }, [audioLevel, isRecording, setAudioLevel]);

  const micColor = isRecording ? "#00D4FF" : "rgba(255,255,255,0.3)";

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Microphone toggle */}
      <div className="flex flex-col items-center gap-1.5">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.93 }}
          onClick={toggleMic}
          className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background: isRecording
              ? "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,122,255,0.15))"
              : "rgba(255,255,255,0.04)",
            border: isRecording
              ? "1.5px solid rgba(0,212,255,0.5)"
              : "1.5px solid rgba(255,255,255,0.08)",
            boxShadow: isRecording
              ? "0 0 20px rgba(0,212,255,0.25), inset 0 1px 0 rgba(255,255,255,0.1)"
              : "0 4px 16px rgba(0,0,0,0.3)",
          }}
        >
          {/* Pulse rings when recording */}
          <AnimatePresence>
            {isRecording && (
              <>
                {[0, 1].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full"
                    style={{ border: "1px solid rgba(0,212,255,0.3)" }}
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 2.0 + i * 0.4, opacity: 0 }}
                    transition={{
                      duration: 1.8,
                      delay: i * 0.5,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {isRecording ? (
            <Mic
              size={16}
              style={{
                color: micColor,
                filter: `drop-shadow(0 0 5px ${micColor})`,
              }}
            />
          ) : (
            <MicOff size={16} style={{ color: micColor }} />
          )}
        </motion.button>

        <span
          className="text-[10px] font-medium tracking-wider uppercase"
          style={{
            color: isRecording
              ? "rgba(0,212,255,0.8)"
              : "rgba(255,255,255,0.18)",
          }}
        >
          {isRecording ? "Live" : "Mic Off"}
        </span>
      </div>

      {/* Error indicator */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1 text-[10px]"
            style={{ color: "#FF6B6B" }}
          >
            <AlertCircle size={10} />
            <span>Mic unavailable</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div className="w-6 h-px bg-white/[0.06]" />

      {/* Barge-in interrupt */}
      <BargeInButton />
    </div>
  );
}
