"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  Building2,
  User,
  ArrowLeft,
  Search,
  Clock,
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
  const activeConvId = searchParams.get("id");
  const { user, role, isOwner, isStudent, isLoggedIn, loading: roleLoading } = useUserRole();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationItem | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!roleLoading) {
      if (!isLoggedIn) {
        router.push("/sign-in");
        return;
      }
      fetchConversations();
    }
  }, [roleLoading, isLoggedIn]);

  useEffect(() => {
    if (activeConvId && conversations.length > 0) {
      const conv = conversations.find((c) => c._id === activeConvId);
      if (conv) {
        setSelectedConv(conv);
      } else if (!selectedConv) {
        setSelectedConv(conversations[0]);
      }
    } else if (!activeConvId && conversations.length > 0 && !selectedConv) {
      setSelectedConv(conversations[0]);
    }
  }, [activeConvId, conversations]);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv._id);
    }
  }, [selectedConv?._id]);

  // Zero-flicker background polling (every 5 seconds, only when tab is visible)
  useEffect(() => {
    if (!selectedConv) return;

    const poll = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      fetchMessagesSilent(selectedConv._id);
      fetchConversationsSilent();
    };

    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [selectedConv?._id]);

  async function fetchConversations() {
    setLoadingConvs(true);
    try {
      const res = await axios.get("/api/chat/conversations");
      const list = res.data.conversations || [];
      setConversations(list);
      if (list.length > 0 && !selectedConv) {
        const initial = activeConvId
          ? list.find((c: ConversationItem) => c._id === activeConvId) || list[0]
          : list[0];
        setSelectedConv(initial);
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
      const newList = res.data.conversations || [];
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
      const msgs = res.data.messages || [];
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
        if (
          prev.length === newMsgs.length &&
          prev[prev.length - 1]?._id === newMsgs[newMsgs.length - 1]?._id
        ) {
          return prev; // Same messages -> zero state change -> zero re-renders/scrolls!
        }
        setTimeout(scrollToBottom, 50);
        return newMsgs;
      });
    } catch {
      /* ignore background poll error */
    }
  }

  async function handleSendMessage() {
    if (!inputMessage.trim() || !selectedConv || !user) return;

    const content = inputMessage.trim();
    setInputMessage("");

    // Optimistic Message Append
    const currentRole = isOwner ? "owner" : "student";
    const tempMsg: MessageItem = {
      _id: "temp_" + Date.now(),
      conversationId: selectedConv._id,
      senderId: user.id,
      senderRole: currentRole,
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setTimeout(scrollToBottom, 50);
    setSending(true);

    try {
      const res = await axios.post(
        `/api/chat/conversations/${selectedConv._id}/messages`,
        { content }
      );
      if (res.data?.message) {
        setMessages((prev) =>
          prev.map((m) => (m._id === tempMsg._id ? res.data.message : m))
        );
      }
      fetchConversationsSilent();
    } catch {
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
    } finally {
      setSending(false);
    }
  }

  if (roleLoading || loadingConvs) {
    return (
      <div className="container py-8">
        <div className="grid gap-6 md:grid-cols-[320px_1fr] h-[calc(100vh-8rem)]">
          <div className="skeleton rounded-xl h-full" />
          <div className="skeleton rounded-xl h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-7xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            In-App Messages
          </h1>
          <p className="text-sm text-muted-foreground">
            Direct chat between Students & PG Owners ({conversations.length} active threads)
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 px-3 py-1 bg-primary/5 text-primary border-primary/20">
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
        <div className="grid gap-4 md:grid-cols-[340px_1fr] h-[calc(100vh-10rem)] min-h-[500px]">
          {/* Left Sidebar: Conversations List */}
          <Card className="flex flex-col overflow-hidden border shadow-sm">
            <div className="border-b bg-muted/40 p-3 font-semibold text-sm flex items-center justify-between">
              <span>Conversations</span>
              <Badge variant="secondary" className="text-xs">
                {conversations.length}
              </Badge>
            </div>
            <div className="flex-1 overflow-y-auto divide-y">
              {conversations.map((conv) => {
                const isSelected = selectedConv?._id === conv._id;
                return (
                  <button
                    key={conv._id}
                    onClick={() => {
                      setSelectedConv(conv);
                      router.push(`/chat?id=${conv._id}`);
                    }}
                    className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 hover:bg-muted/40 ${
                      isSelected ? "bg-primary/10 border-l-4 border-l-primary" : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary/20 to-violet-500/20 text-primary font-bold">
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
              <div className="border-b bg-muted/30 p-4 flex items-center justify-between">
                <div>
                  <Link
                    href={`/listings/${selectedConv.listingId}`}
                    className="font-bold text-base hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    {selectedConv.listingTitle}
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
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
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    View PG
                  </Button>
                </Link>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/50">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center py-10">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Start the conversation regarding &quot;{selectedConv.listingTitle}&quot;
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${
                          isMe ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                            isMe
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-background border text-foreground rounded-bl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 px-1">
                          {getRelativeTime(msg.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="border-t bg-background p-3">
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
                    className="flex-1 text-sm h-11"
                  />
                  <Button
                    type="submit"
                    disabled={sending || !inputMessage.trim()}
                    size="icon"
                    className="h-11 w-11 flex-shrink-0 shadow-sm"
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
              <p className="text-sm text-muted-foreground">
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
