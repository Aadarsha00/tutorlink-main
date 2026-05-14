import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api, { type ChatConversation, type ChatMessage } from "@/services/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const timeLabel = (date?: string | null) =>
  date ? new Date(date).toLocaleString() : "";

function statusBadge(user?: ChatConversation["parent"] | null) {
  const status = user?.moderation_status || (user?.is_active === false ? "blocked" : "active");
  if (status === "blocked") return <Badge className="border-red-200 bg-red-50 text-red-700">Blocked</Badge>;
  if (status === "suspended") return <Badge className="border-amber-200 bg-amber-50 text-amber-700">Suspended</Badge>;
  return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Active</Badge>;
}

type ModerationAction = "suspend" | "block" | "reactivate";

interface ModerationState {
  user: ChatConversation["parent"];
  action: ModerationAction;
}

const initials = (name?: string) =>
  name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";

const senderStyles = (role?: string) =>
  role === "parent"
    ? {
        row: "justify-start",
        avatar: "bg-sky-100 text-sky-800",
        role: "border-sky-200 bg-sky-50 text-sky-700",
        bubble: "border-sky-200 bg-sky-50 text-sky-950",
      }
    : {
        row: "justify-end",
        avatar: "bg-violet-100 text-violet-800",
        role: "border-violet-200 bg-violet-50 text-violet-700",
        bubble: "border-violet-200 bg-violet-50 text-violet-950",
      };

export default function AdminChatsPage() {
  const [conversations, setConversations] = React.useState<ChatConversation[]>([]);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [activeId, setActiveId] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [moderating, setModerating] = React.useState<number | null>(null);
  const [deletingMessage, setDeletingMessage] = React.useState<number | null>(null);
  const [wsConnected, setWsConnected] = React.useState(false);
  const socketRef = React.useRef<WebSocket | null>(null);
  const [moderationState, setModerationState] =
    React.useState<ModerationState | null>(null);
  const [suspendDays, setSuspendDays] = React.useState("7");
  const [moderationReason, setModerationReason] = React.useState(
    "Chat policy violation"
  );

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeId) || null;

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await api.messaging.adminConversations();
      setConversations(data);
      setActiveId((current) => current ?? data[0]?.id ?? null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadConversations();
  }, []);

  React.useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }

    api.messaging
      .adminMessages(activeId)
      .then(setMessages)
      .catch((error) =>
        toast.error(error.response?.data?.error || "Failed to load messages")
      );
  }, [activeId]);

  React.useEffect(() => {
    socketRef.current?.close();
    setWsConnected(false);

    if (!activeId) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
    const ws = new WebSocket(`${wsUrl}/ws/messaging/${activeId}/?token=${token}`);
    socketRef.current = ws;

    const heartbeat = window.setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);
    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);

      if (payload.type === "message.new") {
        const message = payload.data as ChatMessage;
        setMessages((current) =>
          current.some((item) => item.id === message.id) ? current : [...current, message]
        );
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === message.conversation
              ? { ...conversation, last_message: message, updated_at: message.created_at }
              : conversation
          )
        );
      }

      if (payload.type === "messages.read") {
        const messageIds = payload.data?.message_ids as number[] | undefined;
        const readAt = payload.data?.read_at as string | undefined;
        if (messageIds?.length && readAt) {
          setMessages((current) =>
            current.map((message) =>
              messageIds.includes(message.id) ? { ...message, read_at: readAt } : message
            )
          );
        }
      }

      if (payload.type === "messages.deleted") {
        const messageId = payload.data?.message_id as number | undefined;
        if (messageId) {
          setMessages((current) =>
            current.filter((message) => message.id !== messageId)
          );
          loadConversations();
        }
      }
    };

    return () => {
      window.clearInterval(heartbeat);
      ws.close();
    };
  }, [activeId]);

  const openModerationDialog = (
    user: ChatConversation["parent"],
    action: ModerationAction
  ) => {
    setModerationState({ user, action });
    setSuspendDays("7");
    setModerationReason(
      action === "reactivate" ? "" : user.moderation_status === "suspended"
        ? "Repeated chat policy violation"
        : "Chat policy violation"
    );
  };

  const submitModeration = async () => {
    if (!moderationState) return;

    const { user, action } = moderationState;
    const days = action === "suspend" ? Number(suspendDays) : undefined;
    if (action === "suspend" && (!days || days <= 0)) {
      toast.error("Enter a valid suspension length");
      return;
    }

    try {
      setModerating(user.id);
      await api.users.moderate(user.id, {
        action,
        days,
        reason: action === "reactivate" ? "" : moderationReason.trim(),
      });
      toast.success("User moderation updated");
      setModerationState(null);
      await loadConversations();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update user");
    } finally {
      setModerating(null);
    }
  };

  const deleteMessage = async (messageId: number) => {
    if (!activeConversation) return;
    try {
      setDeletingMessage(messageId);
      await api.messaging.adminDeleteMessage(activeConversation.id, messageId);
      setMessages((current) => current.filter((message) => message.id !== messageId));
      await loadConversations();
      toast.success("Message deleted");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete message");
    } finally {
      setDeletingMessage(null);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading chats...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-88px)] bg-neutral-50 p-0 sm:p-4 md:p-6">
      <div className="mx-auto flex h-[calc(100vh-88px)] max-w-7xl flex-col sm:h-[calc(100vh-120px)] md:h-[calc(100vh-136px)]">
        <div className="mb-3 flex shrink-0 flex-col gap-3 px-3 pt-3 sm:mb-6 sm:px-0 sm:pt-0 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-950">Chat Monitor</h1>
            <p className="text-muted-foreground">
              Live monitoring for parent and teacher conversations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                wsConnected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-neutral-200 bg-neutral-50 text-neutral-600"
              )}
            >
              {wsConnected ? "Live" : "Offline"}
            </Badge>
            <Button variant="outline" onClick={loadConversations}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 sm:gap-4 lg:grid-cols-[390px_1fr]">
          <Card
            className={cn(
              "min-h-0 overflow-hidden border-neutral-200",
              activeConversation && "hidden lg:block"
            )}
          >
            <CardHeader className="shrink-0 border-b bg-white">
              <CardTitle className="flex items-center justify-between text-base">
                Conversations
                <Badge variant="secondary">{conversations.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full min-h-0 overflow-y-auto p-0">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setActiveId(conversation.id)}
                  className={cn(
                    "w-full border-b border-neutral-100 p-3 text-left transition-colors hover:bg-neutral-50 sm:p-4",
                    conversation.id === activeId && "bg-emerald-50/80"
                  )}
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-neutral-950">
                        {conversation.gig.title}
                      </p>
                      <p className="mt-1 truncate text-sm">
                        <span className="font-medium text-sky-700">
                          {conversation.parent.full_name}
                        </span>
                        <span className="px-1 text-muted-foreground">to</span>
                        <span className="font-medium text-violet-700">
                          {conversation.teacher.full_name}
                        </span>
                      </p>
                      <p className="mt-2 line-clamp-1 text-sm text-neutral-600">
                        {conversation.last_message?.body || "No messages yet"}
                      </p>
                    </div>
                    <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                      {timeLabel(conversation.last_message?.created_at)}
                    </span>
                  </div>
                </button>
              ))}
              {conversations.length === 0 && (
                <p className="p-6 text-sm text-muted-foreground">
                  No conversations available.
                </p>
              )}
            </CardContent>
          </Card>

          <Card
            className={cn(
              "min-h-0 overflow-hidden border-neutral-200",
              activeConversation ? "flex flex-col" : "hidden lg:flex"
            )}
          >
            <CardHeader className="shrink-0 border-b bg-white">
              <div className="flex items-start gap-3">
                {activeConversation && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 lg:hidden"
                    onClick={() => setActiveId(null)}
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-lg">
                    {activeConversation?.gig.title || "Select a chat"}
                  </CardTitle>
              {activeConversation && (
                <div className="mt-1 min-w-0 space-y-1">
                  <p className="truncate text-sm text-muted-foreground">
                    {activeConversation.gig.subject} - Grade {activeConversation.gig.grade} - {activeConversation.gig.status}
                  </p>
                  <p className="truncate text-sm">
                    <span className="font-semibold text-sky-700">
                      {activeConversation.parent.full_name}
                    </span>
                    <span className="px-2 text-muted-foreground">chatting with</span>
                    <span className="font-semibold text-violet-700">
                      {activeConversation.teacher.full_name}
                    </span>
                  </p>
                </div>
              )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col p-0">
              {activeConversation && (
                <div className="grid gap-0 border-b bg-neutral-50 md:grid-cols-2">
                  {[activeConversation.parent, activeConversation.teacher].map((user) => (
                    <div key={user.id} className="border-b p-3 sm:p-4 md:border-b-0 md:border-r last:md:border-r-0">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-neutral-950">{user.full_name}</p>
                          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        {statusBadge(user)}
                      </div>
                      {user.suspended_until && (
                        <p className="mb-2 text-xs text-amber-700">
                          Suspended until {timeLabel(user.suspended_until)}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={moderating === user.id}
                          onClick={() => openModerationDialog(user, "suspend")}
                        >
                          Suspend
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600"
                          disabled={moderating === user.id}
                          onClick={() => openModerationDialog(user, "block")}
                        >
                          Block
                        </Button>
                        {user.moderation_status !== "active" && (
                          <Button
                            size="sm"
                            disabled={moderating === user.id}
                            onClick={() => openModerationDialog(user, "reactivate")}
                          >
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-neutral-50 p-3 sm:p-5">
                {messages.map((message) => {
                  const styles = senderStyles(message.sender.role);

                  return (
                    <div
                      key={message.id}
                      className={cn("flex items-start gap-3", styles.row)}
                    >
                      {message.sender.role === "parent" && (
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                            styles.avatar
                          )}
                        >
                          {initials(message.sender.full_name)}
                        </div>
                      )}
                      <div
                        className={cn(
                          "min-w-0 max-w-[86%] sm:max-w-[78%]",
                          message.sender.role === "teacher" && "text-right"
                        )}
                      >
                        <div
                          className={cn(
                            "mb-1 flex flex-wrap items-center gap-2",
                            message.sender.role === "teacher" && "justify-end"
                          )}
                        >
                          <p className="text-sm font-semibold text-neutral-950">
                            {message.sender.full_name}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn("capitalize", styles.role)}
                          >
                            {message.sender.role}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {timeLabel(message.created_at)}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "inline-block max-w-full rounded-lg border px-4 py-2 text-left text-sm shadow-sm",
                            styles.bubble
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.body}</p>
                        </div>
                        <div
                          className={cn(
                            "mt-1 flex",
                            message.sender.role === "teacher" && "justify-end"
                          )}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                            disabled={deletingMessage === message.id}
                            onClick={() => deleteMessage(message.id)}
                          >
                            {deletingMessage === message.id ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </div>
                      {message.sender.role === "teacher" && (
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                            styles.avatar
                          )}
                        >
                          {initials(message.sender.full_name)}
                        </div>
                      )}
                    </div>
                  );
                })}
                {activeConversation && messages.length === 0 && (
                  <p className="text-sm text-muted-foreground">No messages yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={Boolean(moderationState)}
        onOpenChange={(open) => !open && setModerationState(null)}
      >
        <DialogContent>
          {moderationState && (
            <>
              <DialogHeader>
                <DialogTitle className="capitalize">
                  {moderationState.action} {moderationState.user.full_name}
                </DialogTitle>
                <DialogDescription>
                  This action affects login, chat access, and the visible profile
                  status for this user.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {moderationState.action === "suspend" && (
                  <div className="space-y-2">
                    <Label htmlFor="suspend-days">Suspension length</Label>
                    <Input
                      id="suspend-days"
                      type="number"
                      min={1}
                      value={suspendDays}
                      onChange={(event) => setSuspendDays(event.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of days the user cannot log in or send messages.
                    </p>
                  </div>
                )}

                {moderationState.action !== "reactivate" && (
                  <div className="space-y-2">
                    <Label htmlFor="moderation-reason">Reason</Label>
                    <Textarea
                      id="moderation-reason"
                      value={moderationReason}
                      onChange={(event) => setModerationReason(event.target.value)}
                      className="min-h-24 resize-none"
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground">
                      This reason is shown on the user profile while moderated.
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setModerationState(null)}>
                  Cancel
                </Button>
                <Button
                  className={cn(
                    moderationState.action === "block" &&
                      "bg-red-600 hover:bg-red-700"
                  )}
                  disabled={moderating === moderationState.user.id}
                  onClick={submitModeration}
                >
                  {moderating === moderationState.user.id
                    ? "Saving..."
                    : moderationState.action === "reactivate"
                    ? "Reactivate"
                    : moderationState.action === "block"
                    ? "Block User"
                    : "Suspend User"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
