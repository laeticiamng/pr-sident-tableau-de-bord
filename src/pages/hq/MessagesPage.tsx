import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Search,
  Trash2,
  Clock,
  User,
  ExternalLink,
  Inbox,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCheck,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { ExecutiveHeader } from "@/components/hq/ExecutiveDataSource";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: messages, isLoading, refetch } = useQuery({
    queryKey: ["contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("id, name, email, phone, subject, message, created_at, read_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContactMessage[];
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contact_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id)
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
      queryClient.invalidateQueries({ queryKey: ["contact-messages-unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("contact_messages")
        .update({ read_at: new Date().toISOString() })
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
      queryClient.invalidateQueries({ queryKey: ["contact-messages-unread-count"] });
      toast.success("Tous les messages marqués comme lus");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
      queryClient.invalidateQueries({ queryKey: ["contact-messages-unread-count"] });
      toast.success("Message supprimé");
      setExpandedId(null);
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const handleExpand = useCallback((msg: ContactMessage) => {
    const isExpanded = expandedId === msg.id;
    setExpandedId(isExpanded ? null : msg.id);
    if (!isExpanded && !msg.read_at) {
      markReadMutation.mutate(msg.id);
    }
  }, [expandedId, markReadMutation]);

  const filtered = messages?.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  });

  const unreadCount = messages?.filter((m) => !m.read_at).length ?? 0;

  return (
    <div className="space-y-6">
      <ExecutiveHeader
        title="Messages de contact"
        subtitle={`${messages?.length ?? 0} message${(messages?.length ?? 0) > 1 ? "s" : ""}${unreadCount > 0 ? ` · ${unreadCount} non lu${unreadCount > 1 ? "s" : ""}` : ""}`}
        source={{ source: "supabase", lastUpdated: new Date(), confidence: "high" }}
        actions={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Tout marquer lu
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>
        }
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, email, sujet…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Messages list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : !filtered?.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Inbox className="h-12 w-12 mb-4 opacity-40" />
            <p className="text-lg font-medium">Aucun message</p>
            <p className="text-sm">{search ? "Aucun résultat pour cette recherche" : "La boîte de réception est vide"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => {
            const isExpanded = expandedId === msg.id;
            const isUnread = !msg.read_at;
            return (
              <Card
                key={msg.id}
                className={cn(
                  "transition-all cursor-pointer hover:border-primary/30",
                  isExpanded && "border-primary/40 shadow-md",
                  isUnread && "border-l-4 border-l-primary"
                )}
              >
                <CardHeader
                  className="py-4 px-5 cursor-pointer"
                  onClick={() => handleExpand(msg)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isUnread && (
                          <Circle className="h-2.5 w-2.5 fill-primary text-primary shrink-0" />
                        )}
                        <CardTitle className={cn(
                          "text-base truncate",
                          isUnread ? "font-bold" : "font-semibold"
                        )}>
                          {msg.subject}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {msg.name}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {msg.email}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: fr })}
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 px-5 pb-5 space-y-4 animate-fade-in">
                    <div className="rounded-lg bg-muted/30 p-4 text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${msg.email}`} className="hover:text-primary underline-offset-2 hover:underline">
                          {msg.email}
                        </a>
                        <a href={`mailto:${msg.email}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </span>
                      {msg.phone && (
                        <span className="flex items-center gap-1.5">
                          📞 {msg.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {format(new Date(msg.created_at), "dd MMM yyyy à HH:mm", { locale: fr })}
                      </span>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          Répondre
                        </a>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer ce message ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Le message de <strong>{msg.name}</strong> sera définitivement supprimé. Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(msg.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
