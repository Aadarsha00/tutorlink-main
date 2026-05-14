import * as React from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReportDialog } from "@/components/reports/ReportDialog";
import api, { type ChatConversation, type ChatMessage } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const timeLabel = (dateString?: string | null) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const previewText = (conversation: ChatConversation) => {
  if (!conversation.last_message) return "No messages yet";
  return conversation.last_message.body;
};

const messageStatusLabel = (
  message: ChatMessage | null,
  currentUserId?: number | null
) => {
  if (!message) return "";

  const mine = message.sender.id === currentUserId;
  if (mine) {
    return message.read_at
      ? `Seen ${timeLabel(message.read_at)}`
      : `Sent ${timeLabel(message.created_at)}`;
  }

  return timeLabel(message.created_at);
};

const openChatStatuses = new Set(["payment_pending", "active", "completed", "disputed"]);

const mediaUrl = (url?: string | null) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;

  try {
    const apiOrigin = new URL(
      import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1"
    ).origin;
    return `${apiOrigin}${url}`;
  } catch {
    return url;
  }
};

const initials = (name?: string | null) =>
  (name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

export default function MessagingPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = React.useState<ChatConversation[]>([]);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [activeId, setActiveId] = React.useState<number | null>(null);
  const [draft, setDraft] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [messagesLoading, setMessagesLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [cancelingMatch, setCancelingMatch] = React.useState(false);
  const [wsConnected, setWsConnected] = React.useState(false);
  const socketRef = React.useRef<WebSocket | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  const activeConversation = conversations.find((item) => item.id === activeId) ?? null;
  const lastOwnMessageId = [...messages]
    .reverse()
    .find((message) => message.sender.id === user?.id)?.id;
  const canSendInActiveConversation =
    !!activeConversation &&
    activeConversation.is_active &&
    openChatStatuses.has(activeConversation.gig.status);

  const scrollToBottom = React.useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }, []);

  const loadConversations = React.useCallback(async () => {
    const data = await api.messaging.conversations();
    setConversations(data);

    const requestedId = Number(searchParams.get("conversation"));
    const nextActive =
      data.find((item) => item.id === requestedId)?.id ?? data[0]?.id ?? null;

    setActiveId((current) => current ?? nextActive);
  }, [searchParams]);

  const loadMessages = React.useCallback(
    async (conversationId: number) => {
      try {
        setMessagesLoading(true);
        const data = await api.messaging.messages(conversationId);
        setMessages(data);
        const readResult = await api.messaging.markRead(conversationId);
        if (readResult.message_ids?.length && readResult.read_at) {
          setMessages((prev) =>
            prev.map((message) =>
              readResult.message_ids?.includes(message.id)
                ? { ...message, read_at: readResult.read_at }
                : message
            )
          );
        }
        setConversations((prev) =>
          prev.map((item) =>
            item.id === conversationId ? { ...item, unread_count: 0 } : item
          )
        );
        scrollToBottom();
      } catch (error: any) {
        toast.error(error.response?.data?.detail || "Failed to load messages");
      } finally {
        setMessagesLoading(false);
      }
    },
    [scrollToBottom]
  );

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        await loadConversations();
      } catch (error: any) {
        if (mounted) {
          toast.error(error.response?.data?.detail || "Failed to load conversations");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [loadConversations]);

  React.useEffect(() => {
    if (!activeId) return;
    setSearchParams({ conversation: String(activeId) }, { replace: true });
    loadMessages(activeId);
  }, [activeId, loadMessages, setSearchParams]);

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
        setMessages((prev) =>
          prev.some((item) => item.id === message.id) ? prev : [...prev, message]
        );
        setConversations((prev) =>
          prev.map((item) =>
            item.id === message.conversation
              ? { ...item, last_message: message, unread_count: 0 }
              : item
          )
        );
        if (message.sender.id !== user?.id) {
          api.messaging.markRead(message.conversation).catch(() => undefined);
        }
        scrollToBottom();
      }

      if (payload.type === "messages.read") {
        const messageIds = payload.data?.message_ids as number[] | undefined;
        const readAt = payload.data?.read_at as string | undefined;

        if (messageIds?.length && readAt) {
          setMessages((prev) =>
            prev.map((message) =>
              messageIds.includes(message.id) ? { ...message, read_at: readAt } : message
            )
          );
          setConversations((prev) =>
            prev.map((conversation) =>
              conversation.last_message &&
              messageIds.includes(conversation.last_message.id)
                ? {
                    ...conversation,
                    last_message: {
                      ...conversation.last_message,
                      read_at: readAt,
                    },
                  }
                : conversation
            )
          );
        }
      }

      if (payload.type === "messages.deleted") {
        const messageId = payload.data?.message_id as number | undefined;
        if (messageId) {
          setMessages((prev) => prev.filter((message) => message.id !== messageId));
        }
      }

      if (payload.type === "message.blocked") {
        toast.error(payload.data?.error || "Message blocked");
      }
    };

    return () => {
      window.clearInterval(heartbeat);
      ws.close();
    };
  }, [activeId, scrollToBottom, user?.id]);

  const appendMessage = (message: ChatMessage) => {
    setMessages((prev) =>
      prev.some((item) => item.id === message.id) ? prev : [...prev, message]
    );
    setConversations((prev) =>
      prev.map((item) =>
        item.id === message.conversation ? { ...item, last_message: message } : item
      )
    );
    scrollToBottom();
  };

  const sendMessage = async () => {
    if (!activeId || !draft.trim()) return;

    const body = draft.trim();
    setSending(true);

    try {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "message.send", body }));
      } else {
        const message = await api.messaging.send(activeId, body);
        appendMessage(message);
      }
      setDraft("");
    } catch (error: any) {
      const data = error.response?.data;
      toast.error(data?.error || data?.body?.[0] || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const cancelMatch = async () => {
    if (!activeConversation?.matched_application_id) return;

    const reason = window.prompt(
      "Optional reason for cancelling this match, for example: schedule issue"
    );

    if (reason === null) return;

    try {
      setCancelingMatch(true);
      await api.applications.cancelMatch(
        activeConversation.matched_application_id,
        reason
      );
      toast.success("Match cancelled. This chat is now read-only.");
      await loadConversations();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to cancel match");
    } finally {
      setCancelingMatch(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-88px)] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-88px)] bg-neutral-50 p-0 sm:p-4 md:p-6">
      <div className="mx-auto flex h-[calc(100vh-88px)] max-w-7xl overflow-hidden border border-neutral-200 bg-white sm:h-[calc(100vh-120px)] sm:rounded-lg md:h-[calc(100vh-136px)]">
        <aside
          className={cn(
            "flex w-full min-w-0 flex-col border-r border-neutral-200 bg-white md:max-w-sm",
            activeConversation && "hidden md:flex"
          )}
        >
          <div className="shrink-0 border-b border-neutral-200 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-neutral-950">Messages</h1>
                <p className="truncate text-sm text-neutral-500">
                  Conversations from accepted selections
                </p>
              </div>
              <Button variant="outline" size="icon" onClick={() => loadConversations()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <MessageCircle className="mb-3 h-10 w-10 text-neutral-400" />
                <p className="text-sm font-medium text-neutral-800">
                  No conversations yet
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Chat opens after a parent selects a teacher and the teacher accepts.
                </p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const selected = conversation.id === activeId;
                return (
                  <button
                    key={conversation.id}
                    onClick={() => setActiveId(conversation.id)}
                    className={cn(
                      "flex w-full gap-3 border-b border-neutral-100 p-3 text-left transition-colors hover:bg-neutral-50 sm:p-4",
                      selected && "bg-emerald-50"
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={mediaUrl(conversation.other_user?.profile_picture)}
                      />
                      <AvatarFallback>
                        {initials(conversation.other_user?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-neutral-950">
                          {conversation.other_user?.full_name || "Conversation"}
                        </p>
                        <div className="flex shrink-0 items-center gap-2">
                          {conversation.last_message && (
                            <span className="text-[11px] font-medium text-neutral-500">
                              {messageStatusLabel(conversation.last_message, user?.id)}
                            </span>
                          )}
                          {conversation.unread_count > 0 && (
                            <Badge className="bg-red-500 text-white">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="truncate text-xs text-neutral-500">
                        {conversation.gig.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                        {previewText(conversation)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section
          className={cn(
            "min-w-0 flex-1 flex-col",
            activeConversation ? "flex" : "hidden md:flex"
          )}
        >
          {!activeConversation ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <MessageCircle className="mb-3 h-12 w-12 text-neutral-400" />
              <p className="text-sm font-medium text-neutral-800">
                Select a conversation
              </p>
            </div>
          ) : (
            <>
              <header className="shrink-0 border-b border-neutral-200 bg-white p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 md:hidden"
                      onClick={() => setActiveId(null)}
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-neutral-950">
                        {activeConversation.other_user?.full_name}
                      </h2>
                      <p className="truncate text-sm text-neutral-500">
                      {activeConversation.gig.title} · {activeConversation.gig.subject}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                    {activeConversation.gig.status === "payment_pending" &&
                      activeConversation.matched_application_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelMatch}
                          disabled={cancelingMatch}
                          className="min-w-0 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          {cancelingMatch ? "Cancelling..." : "Cancel Match"}
                        </Button>
                      )}
                    <Badge variant={canSendInActiveConversation && wsConnected ? "default" : "secondary"}>
                      {!canSendInActiveConversation
                        ? "Closed"
                        : wsConnected
                        ? "Live"
                        : "Connecting"}
                    </Badge>
                  </div>
                </div>
              </header>

              <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex gap-3 text-sm text-amber-900">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Keep communication and payments on TutorSpot. Do not share phone
                    numbers, exact addresses, social media, or payment details.
                  </p>
                </div>
              </div>

              {!canSendInActiveConversation && (
                <div className="border-b border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
                  This conversation is read-only because the gig is no longer active.
                </div>
              )}

              <div className="min-h-0 flex-1 overflow-y-auto bg-neutral-50 p-3 sm:p-4">
                {messagesLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-emerald-700" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-neutral-500">
                    There are no messages till now. Start the conversation about
                    schedule and tutoring expectations.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => {
                      const mine = message.sender.id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={cn("flex", mine ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "flex max-w-[88%] flex-col items-start sm:max-w-[80%] md:max-w-[70%]",
                              mine && "items-end text-right"
                            )}
                          >
                            <div
                              className={cn(
                                "inline-block w-fit max-w-full rounded-lg px-4 py-2 text-sm shadow-sm",
                                mine
                                  ? "bg-emerald-700 text-white"
                                  : "border border-neutral-200 bg-white text-neutral-900"
                              )}
                            >
                              <p className="whitespace-pre-wrap break-words text-left">
                                {message.body}
                              </p>
                            </div>
                            <p
                              className={cn(
                                "mt-1 px-1 text-xs text-neutral-500",
                                mine ? "text-right" : "text-left"
                              )}
                            >
                              {mine && message.id === lastOwnMessageId
                                ? messageStatusLabel(message, user?.id)
                                : timeLabel(message.created_at)}
                            </p>
                            {!mine && (
                              <ReportDialog
                                user={user}
                                target={{
                                  category: "message",
                                  target_type: "message",
                                  target_id: message.id,
                                  target_label: `Message from ${message.sender.full_name}`,
                                  title: `Report message from ${message.sender.full_name}`,
                                }}
                                trigger={
                                  <button className="mt-1 px-1 text-xs text-red-600 hover:underline">
                                    Report
                                  </button>
                                }
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <footer className="shrink-0 border-t border-neutral-200 bg-white p-3 sm:p-4">
                <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Messages with phone numbers, external contacts, exact addresses, or
                  direct payment requests are blocked.
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
                  <Textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      canSendInActiveConversation
                        ? "Write a message"
                        : "This conversation is closed"
                    }
                    className="max-h-32 min-h-11 resize-none rounded-lg"
                    maxLength={2000}
                    disabled={!canSendInActiveConversation}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={sending || !draft.trim() || !canSendInActiveConversation}
                    className="h-11 w-full rounded-lg sm:w-auto"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                </div>
              </footer>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
