import { useEffect } from "react";
import { wsService } from "@/services/websocket.service";

export function useWebSocket() {
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      wsService.connect(token);
      wsService.startHeartbeat();

      // Request browser notification permission
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    return () => {
      wsService.disconnect();
    };
  }, []);

  return wsService;
}
