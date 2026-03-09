import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageCircle, Send, Loader2, Bot, User, Trash2, Plus, ChevronLeft, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation, useLanguage } from "@/contexts/LanguageContext";
import { hqCommon } from "@/i18n/hq-common";

type Msg = { role: "user" | "assistant"; content: string };

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message: string | null;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hq-chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) {
    onError("No server response");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

type ViewMode = "chat" | "history";

export function HQChatSidebar() {
  const { user } = useAuth();
  const t = useTranslation(hqCommon);
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && viewMode === "chat" && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, viewMode]);

  // Load conversations when opening history
  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConversations(true);
    try {
      const { data, error } = await supabase.rpc("get_hq_conversations", { limit_count: 20 });
      if (error) throw error;
      setConversations((data as unknown as Conversation[]) || []);
    } catch (e) {
      console.error("Failed to load conversations:", e);
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  useEffect(() => {
    if (open && viewMode === "history") {
      loadConversations();
    }
  }, [open, viewMode, loadConversations]);

  // Load messages for a conversation
  const loadConversation = useCallback(async (convId: string) => {
    try {
      const { data, error } = await supabase.rpc("get_hq_chat_messages", { p_conversation_id: convId });
      if (error) throw error;
      const msgs: Msg[] = ((data as unknown as { role: string; content: string }[]) || []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      setMessages(msgs);
      setCurrentConversationId(convId);
      setViewMode("chat");
    } catch (e) {
      console.error("Failed to load conversation:", e);
      toast.error(t.loadConversationError);
    }
  }, []);

  // Persist a message to the database
  const persistMessage = useCallback(async (conversationId: string, role: string, content: string) => {
    try {
      await supabase.rpc("add_hq_chat_message", {
        p_conversation_id: conversationId,
        p_role: role,
        p_content: content,
      });
    } catch (e) {
      console.error("Failed to persist message:", e);
    }
  }, []);

  // Create a new conversation
  const createConversation = useCallback(async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc("create_hq_conversation", { p_title: "Nouvelle conversation" });
      if (error) throw error;
      return data as string;
    } catch (e) {
      console.error("Failed to create conversation:", e);
      toast.error("Impossible de créer la conversation");
      return null;
    }
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(async (convId: string) => {
    try {
      await supabase.rpc("delete_hq_conversation", { p_conversation_id: convId });
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (currentConversationId === convId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    } catch (e) {
      console.error("Failed to delete conversation:", e);
      toast.error("Impossible de supprimer la conversation");
    }
  }, [currentConversationId]);

  // Send a message
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Msg = { role: "user", content: text.trim() };
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Ensure we have a conversation
    let convId = currentConversationId;
    if (!convId) {
      convId = await createConversation();
      if (!convId) {
        setIsLoading(false);
        return;
      }
      setCurrentConversationId(convId);
    }

    // Persist user message
    await persistMessage(convId, "user", text.trim());

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    const finalConvId = convId;

    try {
      await streamChat({
        messages: [...messages, userMsg],
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: async () => {
          setIsLoading(false);
          // Persist assistant response
          if (assistantSoFar) {
            await persistMessage(finalConvId, "assistant", assistantSoFar);
          }
        },
        onError: (error) => {
          toast.error(error);
          setIsLoading(false);
        },
      });
    } catch (e) {
      console.error(e);
      toast.error("Erreur de connexion au DG IA");
      setIsLoading(false);
    }
  }, [isLoading, messages, currentConversationId, createConversation, persistMessage]);

  const send = useCallback(() => {
    sendMessage(input);
  }, [input, sendMessage]);

  // Start a new conversation
  const newChat = useCallback(() => {
    setCurrentConversationId(null);
    setMessages([]);
    setViewMode("chat");
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "À l'instant";
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="executive"
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-xl hover:shadow-2xl transition-all"
          aria-label="Ouvrir le chat DG IA"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[420px] p-0 flex flex-col">
        <SheetHeader className="p-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            {viewMode === "history" ? (
              <>
                <Button variant="ghost" size="icon" onClick={() => setViewMode("chat")} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <SheetTitle className="flex-1 text-center text-sm">Historique</SheetTitle>
                <Button variant="ghost" size="icon" onClick={newChat} className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <SheetTitle className="flex items-center gap-2 text-sm">
                  <Bot className="h-5 w-5 text-primary" />
                  DG IA — Assistant Présidentiel
                </SheetTitle>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setViewMode("history")} className="h-8 w-8" title="Historique">
                    <Clock className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={newChat} className="h-8 w-8" title="Nouvelle conversation">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetHeader>

        {/* History View */}
        {viewMode === "history" && (
          <ScrollArea className="flex-1">
            {loadingConversations ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center text-muted-foreground mt-12 space-y-2">
                <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/30" />
                <p className="text-sm">Aucune conversation</p>
                <Button variant="outline" size="sm" onClick={newChat}>
                  <Plus className="h-3 w-3 mr-1" />
                  Démarrer
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      "flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors group",
                      conv.id === currentConversationId && "bg-muted/70"
                    )}
                    onClick={() => loadConversation(conv.id)}
                  >
                    <Bot className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{conv.title}</p>
                      {conv.last_message && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {conv.last_message.slice(0, 80)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {formatDate(conv.updated_at)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}

        {/* Chat View */}
        {viewMode === "chat" && (
          <>
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground mt-12 space-y-3">
                  <Bot className="h-12 w-12 mx-auto text-primary/30" />
                  <p className="text-sm font-medium">Bonjour, Madame la Présidente</p>
                  <p className="text-xs max-w-[280px] mx-auto">
                    Posez vos questions sur l'écosystème, les KPIs, la stratégie ou demandez une analyse.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    {["Résumé du jour", "Santé des plateformes", "KPIs financiers"].map((q) => (
                      <Button
                        key={q}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => sendMessage(q)}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 max-w-[85%] text-sm",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center mt-1">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 pt-2 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Posez votre question..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
