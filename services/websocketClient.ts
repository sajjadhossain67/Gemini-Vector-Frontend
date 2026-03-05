import type { WebSocketEvent } from "@/types/travelTypes";

type EventHandler = (event: WebSocketEvent) => void;
type StatusHandler = (connected: boolean) => void;

export class VectorWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers: EventHandler[] = [];
  private statusHandlers: StatusHandler[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private shouldReconnect = true;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    try {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => {
        this.reconnectDelay = 1000;
        this.statusHandlers.forEach((h) => h(true));
        this.ws?.send(JSON.stringify({ type: "authenticate", token: "demo" }));
      };
      this.ws.onmessage = (e) => {
        try {
          const event: WebSocketEvent = JSON.parse(e.data as string);
          this.handlers.forEach((h) => h(event));
        } catch {
          // ignore malformed messages
        }
      };
      this.ws.onclose = () => {
        this.statusHandlers.forEach((h) => h(false));
        if (this.shouldReconnect) this.scheduleReconnect();
      };
      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      if (this.shouldReconnect) this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectDelay = Math.min(
        this.reconnectDelay * 2,
        this.maxReconnectDelay,
      );
      this.connect();
    }, this.reconnectDelay);
  }

  send(data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  sendAudio(pcmData: ArrayBuffer) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(pcmData);
    }
  }

  onEvent(handler: EventHandler) {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  onStatus(handler: StatusHandler) {
    this.statusHandlers.push(handler);
    return () => {
      this.statusHandlers = this.statusHandlers.filter((h) => h !== handler);
    };
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }

  get readyState() {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}

export const createWebSocket = (url: string) => new VectorWebSocket(url);
