"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTravelStore } from "@/store/travelStore";
import { AudioStreamService } from "@/services/audioStream";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws";
// websocketClient is used for audio streaming (see useAgentEvents for event stream)

export function useGeminiLive() {
  const audioService = useRef<AudioStreamService | null>(null);
  const setAudioLevel = useTravelStore((s) => s.setAudioLevel);
  const setConnected = useTravelStore((s) => s.setConnected);
  const addLog = useTravelStore((s) => s.addLog);

  const startStreaming = useCallback(async () => {
    try {
      if (!audioService.current) {
        audioService.current = new AudioStreamService();
        await audioService.current.init(
          (_pcm) => {
            // send to WS when real backend is connected
          },
          (level) => setAudioLevel(level),
        );
      }
      await audioService.current.start();
      setConnected(true);
      addLog("Microphone streaming active", "success");
    } catch (err) {
      addLog(
        `Microphone error: ${err instanceof Error ? err.message : "Unknown"}`,
        "error",
      );
    }
  }, [setAudioLevel, setConnected, addLog]);

  const stopStreaming = useCallback(async () => {
    await audioService.current?.close();
    audioService.current = null;
    setAudioLevel(0);
  }, [setAudioLevel]);

  const interrupt = useCallback(() => {
    addLog("Interrupt signal sent", "action");
  }, [addLog]);

  useEffect(() => {
    return () => {
      audioService.current?.close();
    };
  }, []);

  return { startStreaming, stopStreaming, interrupt, wsUrl: WS_URL };
}
