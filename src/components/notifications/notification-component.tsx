import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification01Icon,
  CheckmarkCircle01Icon,
  MailOpen01Icon,
  FilterIcon,
  ArrowLeft01Icon,
  BriefcaseIcon,
  DollarCircleIcon,
  AlertCircleIcon,
  ChatIcon,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";
import type { Notification } from "@/services/api";
import { useNavigate } from "react-router-dom";

// Helper function to normalize API response to array
const normalizeNotifications = (data: any): Notification[] => {
  console.log("🔄 Normalizing response:", {
    type: typeof data,
    isArray: Array.isArray(data),
    hasResults: data && "results" in data,
    keys: data && typeof data === "object" ? Object.keys(data) : [],
  });

  // If it's already an array, return it
  if (Array.isArray(data)) {
    console.log("✅ Data is array, length:", data.length);
    return data;
  }

  // If it's an object with results (paginated response from DRF)
  if (
    data &&
    typeof data === "object" &&
    "results" in data &&
    Array.isArray(data.results)
  ) {
    console.log(
      "✅ Data is paginated DRF response, results length:",
      data.results.length
    );
    return data.results;
  }

  // If it's an object with data property
  if (data && typeof data === "object" && "data" in data) {
    console.log("✅ Data has 'data' property, recursing");
    return normalizeNotifications(data.data);
  }

  // Otherwise return empty array
  console.warn(
    "⚠️ Could not normalize data, returning empty array. Data:",
    data
  );
  return [];
};

// WebSocket service class
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isIntentionallyClosed = false;
  private isConnecting = false;
  private heartbeatId: number | null = null;

  connect(token: string) {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      console.log("⚠️ Already connected or connecting");
      return;
    }

    this.isIntentionallyClosed = false;
    this.isConnecting = true;
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
    const url = `${wsUrl}/ws/notifications/?token=${token}`;

    console.log("🔌 Connecting to WebSocket...");

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log("✅ WebSocket connected");
        this.isConnecting = false;
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
        console.error("❌ WebSocket error:", error);
        this.isConnecting = false;
        this.emit("error", error);
      };

      this.ws.onclose = (event) => {
        console.log(`🔌 WebSocket closed: code=${event.code}`);
        this.isConnecting = false;
        this.emit("connection", { status: "disconnected" });
        if (!this.isIntentionallyClosed) {
          this.attemptReconnect(token);
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection", error);
      this.isConnecting = false;
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
    }
  }

  private handleMessage(message: any) {
    const { type, data } = message;
    switch (type) {
      case "connection.established":
        console.log("✅ Connection established");
        this.emit("connected", data);
        this.emit("connection", { status: "connected" });
        break;
      case "notification.new":
        console.log("🔔 New notification:", data);
        this.emit("notification", data);
        break;
      case "notification.marked_read":
        this.emit("notification_read", data);
        break;
      case "pong":
        break;
    }
  }

  send(type: string, data: any = {}) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    }
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

  startHeartbeat() {
    if (this.heartbeatId !== null) return;

    this.heartbeatId = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send("ping");
      }
    }, 30000);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

const wsService = new WebSocketService();

const emitNotificationEvent = (data: Notification) => {
  window.dispatchEvent(
    new CustomEvent("tutorlink:notification", { detail: data })
  );
};

// Helper functions
const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    application_received: BriefcaseIcon,
    teacher_selected: CheckmarkCircle01Icon,
    selection_accepted: CheckmarkCircle01Icon,
    selection_rejected: AlertCircleIcon,
    match_cancelled: AlertCircleIcon,
    rate_change_requested: DollarCircleIcon,
    rate_change_approved: CheckmarkCircle01Icon,
    rate_change_rejected: AlertCircleIcon,
    payment_initiated: DollarCircleIcon,
    payment_released: DollarCircleIcon,
    payment_refunded: DollarCircleIcon,
    dispute_opened: AlertCircleIcon,
    gig_started: BriefcaseIcon,
    gig_completed: CheckmarkCircle01Icon,
    premium_activated: CheckmarkCircle01Icon,
    premium_expiring: AlertCircleIcon,
    premium_expired: AlertCircleIcon,
    message_received: ChatIcon,
    system_announcement: Notification01Icon,
    test: Notification01Icon,
  };
  return iconMap[type] || Notification01Icon;
};

const getNotificationColor = (type: string) => {
  if (
    type.includes("reject") ||
    type.includes("cancel") ||
    type.includes("expired") ||
    type.includes("dispute")
  ) {
    return "text-red-500";
  }
  if (
    type.includes("accept") ||
    type.includes("completed") ||
    type.includes("activated")
  ) {
    return "text-green-500";
  }
  if (type.includes("payment")) {
    return "text-blue-500";
  }
  return "text-primary";
};

const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

// Notification Dropdown Component
export function NotificationDropdown() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [wsConnected, setWsConnected] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    return setupWebSocket();
  }, []);

  const setupWebSocket = () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      wsService.connect(token);
      wsService.startHeartbeat();

      const handleNewNotification = (data: any) => {
        console.log("🔔 New notification in dropdown:", data);
        emitNotificationEvent(data);
        setNotifications((prev) => {
          if (prev.some((notification) => notification.id === data.id)) {
            return prev.map((notification) =>
              notification.id === data.id ? data : notification
            );
          }

          return [data, ...prev].slice(0, 5);
        });
        setUnreadCount((prev) => (data.is_read ? prev : prev + 1));

        if (Notification.permission === "granted") {
          new Notification(data.title, {
            body: data.message,
            icon: "/logo.png",
          });
        }
      };

      const handleConnection = (data: any) => {
        setWsConnected(data.status === "connected");
      };

      wsService.on("notification", handleNewNotification);
      wsService.on("connection", handleConnection);
      wsService.on("connected", () => setWsConnected(true));

      return () => {
        wsService.off("notification", handleNewNotification);
        wsService.off("connection", handleConnection);
      };
    }

    return undefined;
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      console.log("📋 Loading notifications for dropdown...");

      const data = await api.notifications.list();
      console.log("📦 Raw API response:", data);

      // Normalize the response to always get an array
      const notificationArray = normalizeNotifications(data);
      console.log("📋 Normalized array length:", notificationArray.length);

      // Keep only first 5 for dropdown
      const dropdownNotifications = notificationArray.slice(0, 5);
      setNotifications(dropdownNotifications);

      console.log(
        "✅ Set",
        dropdownNotifications.length,
        "notifications in dropdown"
      );
    } catch (error: any) {
      console.error("❌ Failed to load notifications:", error);
      console.error("❌ Error response:", error.response?.data);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await api.notifications.unreadCount();
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error("Failed to load unread count", error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      console.log("✓ Marked notification", id, "as read");
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <HugeiconsIcon icon={Notification01Icon} size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold flex items-center gap-2">
            Notifications
            {!wsConnected && (
              <span className="text-xs text-muted-foreground font-normal">
                (Offline)
              </span>
            )}
          </span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <>
            <div className="p-8 text-center">
              <HugeiconsIcon
                icon={Notification01Icon}
                size={48}
                className="text-muted-foreground mx-auto mb-2 opacity-50"
              />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer justify-center text-primary"
              onClick={() => {
                navigate("/notifications");
                setIsOpen(false);
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(
                  notification.notification_type
                );
                const iconColor = getNotificationColor(
                  notification.notification_type
                );

                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className="cursor-pointer p-3 focus:bg-muted"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3 w-full">
                      <div className={`mt-1 ${iconColor}`}>
                        <HugeiconsIcon icon={Icon} size={20} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm font-medium ${
                              !notification.is_read
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <div className="h-2 w-2 rounded-full bg-blue-500 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {timeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer justify-center text-primary"
              onClick={() => {
                navigate("/notifications");
                setIsOpen(false);
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Full Notifications Page
export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<"all" | "unread">("all");
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [wsConnected, setWsConnected] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    loadData();
    return setupWebSocket();
  }, []);

  const setupWebSocket = () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      wsService.connect(token);
      wsService.startHeartbeat();

      const handleNewNotification = (data: any) => {
        console.log("🔔 New notification on page:", data);
        setNotifications((prev) => {
          if (prev.some((notification) => notification.id === data.id)) {
            return prev.map((notification) =>
              notification.id === data.id ? data : notification
            );
          }

          return [data, ...prev];
        });
        setUnreadCount((prev) => (data.is_read ? prev : prev + 1));
      };

      const handleConnection = (data: any) => {
        setWsConnected(data.status === "connected");
      };

      wsService.on("notification", handleNewNotification);
      wsService.on("connection", handleConnection);
      wsService.on("connected", () => setWsConnected(true));

      return () => {
        wsService.off("notification", handleNewNotification);
        wsService.off("connection", handleConnection);
      };
    }

    return undefined;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      console.log("📋 Loading all notifications for page...");

      const [notificationsData, countData] = await Promise.all([
        api.notifications.list(),
        api.notifications.unreadCount(),
      ]);

      console.log("📦 Raw API response:", notificationsData);

      // Normalize the response to always get an array
      const notificationArray = normalizeNotifications(notificationsData);
      console.log("📋 Normalized array length:", notificationArray.length);

      setNotifications(notificationArray);
      setUnreadCount(countData.unread_count);

      console.log("✅ Loaded", notificationArray.length, "notifications");
      if (notificationArray.length > 0) {
        console.log("📬 First notification:", notificationArray[0]);
      }
    } catch (error: any) {
      console.error("❌ Failed to load notifications:", error);
      console.error("❌ Error response:", error.response?.data);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  const handleBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto p-6 max-w-4xl">
        <Button variant="ghost" className="mb-4" onClick={handleBack}>
          <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={Notification01Icon} size={24} />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="default">{unreadCount} new</Badge>
                  )}
                  {!wsConnected && <Badge variant="secondary">Offline</Badge>}
                </CardTitle>
                <CardDescription>
                  Stay updated with your tutoring activities
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter(filter === "all" ? "unread" : "all")}
                >
                  <HugeiconsIcon icon={FilterIcon} data-icon="inline-start" />
                  {filter === "all" ? "Show Unread" : "Show All"}
                </Button>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    <HugeiconsIcon
                      icon={MailOpen01Icon}
                      data-icon="inline-start"
                    />
                    Mark All Read
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <HugeiconsIcon
                  icon={Notification01Icon}
                  size={64}
                  className="text-muted-foreground mx-auto mb-4 opacity-50"
                />
                <p className="text-lg font-medium mb-1">No notifications</p>
                <p className="text-sm text-muted-foreground">
                  {filter === "unread"
                    ? "You're all caught up!"
                    : "You'll see notifications here when you receive them"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(
                    notification.notification_type
                  );
                  const iconColor = getNotificationColor(
                    notification.notification_type
                  );

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                        !notification.is_read
                          ? "bg-blue-50 border-blue-200"
                          : "bg-background"
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-4">
                        <div className={`mt-1 ${iconColor}`}>
                          <HugeiconsIcon icon={Icon} size={24} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className={`font-semibold ${
                                !notification.is_read
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {timeAgo(notification.created_at)}
                              </span>
                              {!notification.is_read && (
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          {notification.metadata &&
                            Object.keys(notification.metadata).length > 0 && (
                              <div className="flex gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {notification.notification_type.replace(
                                    /_/g,
                                    " "
                                  )}
                                </Badge>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
