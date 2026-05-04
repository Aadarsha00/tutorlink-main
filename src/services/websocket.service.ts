export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isIntentionallyClosed = false;

  connect(token: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isIntentionallyClosed = false;
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
    const url = `${wsUrl}/ws/notifications/?token=${token}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
        this.emit("connection", { status: "connected" });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error", error);
        this.emit("error", error);
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.emit("connection", { status: "disconnected" });

        if (!this.isIntentionallyClosed) {
          this.attemptReconnect(token);
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection", error);
    }
  }

  disconnect() {
    this.isIntentionallyClosed = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private attemptReconnect(token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      setTimeout(() => {
        this.connect(token);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("Max reconnection attempts reached");
      this.emit("connection", { status: "failed" });
    }
  }

  private handleMessage(message: any) {
    const { type, data } = message;

    switch (type) {
      case "connection.established":
        this.emit("connected", data);
        break;
      case "notification.new":
        this.emit("notification", data);
        break;
      case "notification.marked_read":
        this.emit("notification_read", data);
        break;
      case "pong":
        // Heartbeat response
        break;
      default:
        console.warn("Unknown message type:", type);
    }
  }

  send(type: string, data: any = {}) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    } else {
      console.warn("WebSocket is not connected");
    }
  }

  markAsRead(notificationId: number) {
    this.send("notification.mark_read", { notification_id: notificationId });
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  // Heartbeat to keep connection alive
  startHeartbeat() {
    setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send("ping");
      }
    }, 30000); // Every 30 seconds
  }
}

export const wsService = new WebSocketService();
