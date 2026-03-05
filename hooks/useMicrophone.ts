"use client";

import { useState, useRef, useCallback } from "react";

interface MicrophoneState {
  isRecording: boolean;
  audioLevel: number;
  error: string | null;
}

export function useMicrophone(onAudioChunk?: (data: Float32Array) => void) {
  const [state, setState] = useState<MicrophoneState>({
    isRecording: false,
    audioLevel: 0,
    error: null,
  });
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;
      const ctx = new AudioContext({ sampleRate: 16000 });
      contextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      const tick = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let _i = 0; _i < data.length; _i++)
          sum += Math.abs(data[_i] - 128);
        const level = Math.min(1, sum / (data.length * 64));
        setState((s) => ({ ...s, audioLevel: level }));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);

      if (onAudioChunk) {
        const processor = ctx.createScriptProcessor(4096, 1, 1);
        processor.onaudioprocess = (e) =>
          onAudioChunk(e.inputBuffer.getChannelData(0));
        source.connect(processor);
        processor.connect(ctx.destination);
      }

      setState({ isRecording: true, audioLevel: 0, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Microphone access denied",
      }));
    }
  }, [onAudioChunk]);

  const stopRecording = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    contextRef.current?.close();
    streamRef.current = null;
    contextRef.current = null;
    setState({ isRecording: false, audioLevel: 0, error: null });
  }, []);

  return { ...state, startRecording, stopRecording };
}
