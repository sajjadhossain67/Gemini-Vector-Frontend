// AudioWorklet processor — runs in its own thread off the main UI thread
// This file is loaded as a URL via audioContext.audioWorklet.addModule()

/* eslint-disable */
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean;
}
declare function registerProcessor(name: string, ctor: unknown): void;

class AudioProcessor extends AudioWorkletProcessor {
  private _buffer: Float32Array[] = [];
  private _bufferSize = 2048;
  private _collectedSamples = 0;

  process(inputs: Float32Array[][]): boolean {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channel = input[0];
    this._buffer.push(new Float32Array(channel));
    this._collectedSamples += channel.length;

    if (this._collectedSamples >= this._bufferSize) {
      // Merge collected chunks
      const merged = new Float32Array(this._collectedSamples);
      let offset = 0;
      for (const chunk of this._buffer) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      this._buffer = [];
      this._collectedSamples = 0;

      // Calculate RMS level
      let sum = 0;
      for (let i = 0; i < merged.length; i++) {
        sum += merged[i] * merged[i];
      }
      const rms = Math.sqrt(sum / merged.length);

      this.port.postMessage({ pcm: merged, level: rms });
    }

    return true;
  }
}

registerProcessor("audio-processor", AudioProcessor);
