import { useState, useEffect, useCallback } from "react";
import api from "@/services/api";
import { wsService } from "@/services/websocket.service";

interface Notification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  link: string;
  metadata?: any;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const [notificationsRes, countRes] = await Promise.all([
        api.notifications.list(),
        api.notifications.unreadCount(),
      ]);
      // API returns Notification[] directly, not { results: Notification[] }
      setNotifications(notificationsRes || []);
      setUnreadCount(countRes.unread_count);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await api.notifications.markRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      // Also send via WebSocket
      wsService.markAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  }, []);

  // Handle new notifications from WebSocket
  useEffect(() => {
    const handleNewNotification = (data: any) => {
      const newNotification: Notification = {
        id: data.id,
        notification_type: data.notification_type,
        title: data.title,
        message: data.message,
        link: data.link,
        metadata: data.metadata,
        is_read: false,
        created_at: data.created_at,
      };
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show browser notification if permitted
      if (Notification.permission === "granted") {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: "/logo.png",
        });
      }
    };

    wsService.on("notification", handleNewNotification);

    return () => {
      wsService.off("notification", handleNewNotification);
    };
  }, []);

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
  };
}
