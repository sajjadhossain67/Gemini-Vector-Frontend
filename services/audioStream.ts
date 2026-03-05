export class AudioStreamService {
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private onChunk: ((data: Float32Array) => void) | null = null;
  private onLevel: ((level: number) => void) | null = null;

  async init(
    onChunk: (data: Float32Array) => void,
    onLevel: (level: number) => void,
  ) {
    this.onChunk = onChunk;
    this.onLevel = onLevel;
    this.audioContext = new AudioContext({ sampleRate: 16000 });
    await this.audioContext.audioWorklet.addModule("/audioProcessor.js");
  }

  async start() {
    if (!this.audioContext)
      throw new Error("AudioStreamService not initialized");
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
    this.workletNode = new AudioWorkletNode(
      this.audioContext,
      "audio-processor",
    );
    this.workletNode.port.onmessage = (
      e: MessageEvent<{ pcm: Float32Array; level: number }>,
    ) => {
      this.onChunk?.(e.data.pcm);
      this.onLevel?.(e.data.level);
    };
    this.sourceNode.connect(this.workletNode);
    this.workletNode.connect(this.audioContext.destination);
  }

  stop() {
    this.workletNode?.disconnect();
    this.sourceNode?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.workletNode = null;
    this.sourceNode = null;
    this.stream = null;
  }

  async close() {
    this.stop();
    await this.audioContext?.close();
    this.audioContext = null;
  }
}
