"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  Building2,
  Search,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { getRelativeTime } from "@/lib/utils";
import { useUserRole } from "@/lib/useUserRole";

interface ConversationItem {
  _id: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  ownerId: string;
  listingId: string;
  listingTitle: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCountStudent?: number;
  unreadCountOwner?: number;
}

interface MessageItem {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: "student" | "owner";
  content: string;
  createdAt: string;
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get("id");
  const { user, isOwner, isLoggedIn, loading: roleLoading } = useUserRole();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(initialConvId);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const activeConvIdRef = useRef<string | null>(selectedConvId);

  // Derived selected conversation object from stable ID
  const selectedConv = conversations.find((c) => c._id === selectedConvId) || null;

  useEffect(() => {
    activeConvIdRef.current = selectedConvId;
  }, [selectedConvId]);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  };

  // 1. Initial auth check & fetch conversations
  useEffect(() => {
    if (!roleLoading) {
      if (!isLoggedIn) {
        router.push("/sign-in");
        return;
      }
      fetchConversationsInitial();
    }
  }, [roleLoading, isLoggedIn]);

  // 2. Sync selected conversation when initial target ID changes or conversations load
  useEffect(() => {
    if (conversations.length > 0) {
      if (initialConvId && conversations.some((c) => c._id === initialConvId)) {
        if (selectedConvId !== initialConvId) {
          setSelectedConvId(initialConvId);
        }
      } else if (!selectedConvId) {
        setSelectedConvId(conversations[0]._id);
      }
    }
  }, [initialConvId, conversations]);

  // 3. Fetch messages whenever selected conversation ID changes
  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
    } else {
      setMessages([]);
    }
  }, [selectedConvId]);

  // 4. Background polling (paused when tab is hidden, no UI loading spinners)
  useEffect(() => {
    if (!selectedConvId) return;

    const poll = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      if (activeConvIdRef.current) {
        fetchMessagesSilent(activeConvIdRef.current);
      }
      fetchConversationsSilent();
    };

    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [selectedConvId]);

  async function fetchConversationsInitial() {
    setLoadingConvs(true);
    try {
      const res = await axios.get("/api/chat/conversations");
      const list: ConversationItem[] = res.data.conversations || [];
      setConversations(list);

      if (list.length > 0 && !selectedConvId) {
        const targetId = initialConvId && list.some((c) => c._id === initialConvId)
          ? initialConvId
          : list[0]._id;
        setSelectedConvId(targetId);
      }
    } catch {
      toast.error("Failed to load conversation history");
    } finally {
      setLoadingConvs(false);
    }
  }

  async function fetchConversationsSilent() {
    try {
      const res = await axios.get("/api/chat/conversations");
      const newList: ConversationItem[] = res.data.conversations || [];
      setConversations((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(newList)) return prev;
        return newList;
      });
    } catch {
      /* ignore background poll error */
    }
  }

  async function fetchMessages(convId: string) {
    setLoadingMessages(true);
    try {
      const res = await axios.get(`/api/chat/conversations/${convId}/messages`);
      const msgs: MessageItem[] = res.data.messages || [];
      setMessages(msgs);
      setTimeout(scrollToBottom, 50);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function fetchMessagesSilent(convId: string) {
    try {
      const res = await axios.get(`/api/chat/conversations/${convId}/messages`);
      const newMsgs: MessageItem[] = res.data.messages || [];

      setMessages((prev) => {
        // Deep compare last message ID to avoid unnecessary state mutations
        const prevLastId = prev[prev.length - 1]?._id;
        const newLastId = newMsgs[newMsgs.length - 1]?._id;

        if (prev.length === newMsgs.length && prevLastId === newLastId) {
          return prev;
        }
        return newMsgs;
      });
    } catch {
      /* ignore background poll error */
    }
  }

  const handleSelectThread = (convId: string) => {
    setSelectedConvId(convId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/chat?id=${convId}`);
    }
  };

  async function handleSendMessage() {
    if (!inputMessage.trim() || !selectedConvId || !user) return;

    const content = inputMessage.trim();
    setInputMessage("");

    const targetConvId = selectedConvId;
    setSending(true);

    try {
      const res = await axios.post(
        `/api/chat/conversations/${targetConvId}/messages`,
        { content }
      );

      if (res.data?.message) {
        const confirmedMsg: MessageItem = res.data.message;
        setMessages((prev) => prev.some((message) => message._id === confirmedMsg._id) ? prev : [...prev, confirmedMsg]);
      }
      fetchConversationsSilent();
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  const allDisplayMessages = messages;

  if (roleLoading || loadingConvs) {
    return (
      <div className="container py-8 max-w-7xl">
        <div className="grid gap-6 md:grid-cols-[340px_1fr] h-[calc(100vh-10rem)] min-h-[500px]">
          <div className="skeleton rounded-xl h-full" />
          <div className="skeleton rounded-xl h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl px-3 py-3 sm:px-6 sm:py-6">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-bold sm:text-2xl">
            <MessageSquare className="h-6 w-6 text-primary" />
            In-App Messages
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Direct chat between Students & PG Owners ({conversations.length} active threads)
          </p>
        </div>
        <Badge variant="outline" className="hidden gap-1.5 border-primary/20 bg-primary/5 px-3 py-1 text-primary sm:flex">
          <Sparkles className="h-3.5 w-3.5" /> Real-time messaging
        </Badge>
      </div>

      {conversations.length === 0 ? (
        <Card className="py-20 text-center">
          <CardContent className="flex flex-col items-center justify-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-xl font-bold">No Conversations Yet</h3>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              {isOwner
                ? "When students contact you regarding your PG listings, your chat conversations will appear here."
                : "Browse PG accommodations and click 'Send Inquiry' to start chatting directly with property owners."}
            </p>
            <Link href={isOwner ? "/dashboard" : "/listings"}>
              <Button className="gap-2">
                {isOwner ? (
                  <>
                    <Building2 className="h-4 w-4" /> Go to Owner Dashboard
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" /> Browse PGs
                  </>
                )}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid h-[calc(100dvh-8.5rem)] min-h-0 grid-rows-[9rem_minmax(0,1fr)] gap-3 md:h-[calc(100vh-10rem)] md:min-h-[500px] md:grid-cols-[340px_1fr] md:grid-rows-1 md:gap-4">
          {/* Left Sidebar: Conversations List */}
          <Card className="flex flex-col overflow-hidden border shadow-sm">
            <div className="flex items-center justify-between border-b bg-muted/40 p-2.5 text-sm font-semibold sm:p-3">
              <span>Conversations</span>
              <Badge variant="secondary" className="text-xs">
                {conversations.length}
              </Badge>
            </div>
            <div className="flex-1 divide-y overflow-y-auto">
              {conversations.map((conv) => {
                const isSelected = selectedConvId === conv._id;
                return (
                  <button
                    key={conv._id}
                    onClick={() => handleSelectThread(conv._id)}
                    className={`flex w-full items-start gap-3 p-2.5 text-left transition-colors hover:bg-muted/40 sm:p-3.5 ${
                      isSelected ? "bg-primary/10 border-l-4 border-l-primary" : ""
                    }`}
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-primary/20 to-violet-500/20 text-primary font-bold">
                      {conv.listingTitle ? conv.listingTitle.charAt(0) : "P"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm truncate">
                          {conv.listingTitle}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          {getRelativeTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-0.5 truncate">
                        {isOwner ? `Student: ${conv.studentName || "Student"}` : "PG Owner"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {conv.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Right Panel: Active Chat Thread */}
          {selectedConv ? (
            <Card className="flex flex-col overflow-hidden border shadow-sm">
              {/* Thread Header */}
              <div className="flex items-center justify-between gap-2 border-b bg-muted/30 p-3 sm:p-4">
                <div className="min-w-0">
                  <Link
                    href={`/listings/${selectedConv.listingId}`}
                    className="flex items-center gap-1.5 truncate text-sm font-bold transition-colors hover:text-primary sm:text-base"
                  >
                    {selectedConv.listingTitle}
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    Participant:{" "}
                    <span className="font-semibold text-foreground">
                      {isOwner
                        ? `${selectedConv.studentName || "Student User"} ${
                            selectedConv.studentEmail ? `(${selectedConv.studentEmail})` : ""
                          }`
                        : "PG Accommodation Owner"}
                    </span>
                  </p>
                </div>
                <Link href={`/listings/${selectedConv.listingId}`}>
                  <Button variant="outline" size="sm" className="hidden gap-1.5 text-xs sm:flex">
                    View PG
                  </Button>
                </Link>
              </div>

              {/* Messages Area */}
              <div ref={messagesContainerRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-slate-50/50 p-3 dark:bg-slate-950/50 sm:p-4">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : allDisplayMessages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center py-10">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Start the conversation regarding &quot;{selectedConv.listingTitle}&quot;
                    </p>
                  </div>
                ) : (
                  allDisplayMessages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    const isTemp = false;
                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${
                          isMe ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] break-words rounded-2xl px-3 py-2 text-sm shadow-sm sm:max-w-[80%] sm:px-4 sm:py-2.5 ${
                            isMe
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-background border text-foreground rounded-bl-none"
                          } ${isTemp ? "opacity-75" : ""}`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 px-1 flex items-center gap-1">
                          {isTemp ? "Sending..." : getRelativeTime(msg.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="border-t bg-background p-2 sm:p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="h-11 flex-1 text-base sm:text-sm"
                  />
                  <Button
                    type="submit"
                    disabled={sending || !inputMessage.trim()}
                    size="icon"
                    className="h-11 w-11 flex-shrink-0 touch-manipulation shadow-sm"
                  >
                    {sending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </Card>
          ) : (
            <Card className="flex items-center justify-center text-center p-8">
              <p className="text-xs text-muted-foreground sm:text-sm">
                Select a conversation from the left panel to start messaging.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-8">
          <div className="skeleton h-[calc(100vh-8rem)] rounded-xl" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
