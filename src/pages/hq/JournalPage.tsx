import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Plus, Pin, PinOff, Trash2, Target, StickyNote,
  Flag, Brain, TrendingUp, Sparkles, Loader2,
} from "lucide-react";
import { ExecutiveHeader } from "@/components/hq/ExecutiveDataSource";
import {
  useJournalEntries, useCreateJournalEntry, useUpdateJournalEntry,
  useDeleteJournalEntry, type JournalEntry,
} from "@/hooks/useJournal";
import { JournalPDFExport } from "@/components/hq/journal/JournalPDFExport";
import { useStripeKPIs, formatCurrency } from "@/hooks/useStripeKPIs";
import { usePlatforms } from "@/hooks/useHQData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { fr, enGB, de } from "date-fns/locale";
import { useTranslation } from "@/contexts/LanguageContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { hqCommon } from "@/i18n/hq-common";

const DATE_LOCALES = { fr, en: enGB, de } as const;

function useTypeConfig() {
  const t = useTranslation(hqCommon);
  return {
    decision: { label: t.journalTypeDecision, icon: Target, color: "text-primary" },
    note: { label: t.journalTypeNote, icon: StickyNote, color: "text-accent" },
    milestone: { label: t.journalTypeMilestone, icon: Flag, color: "text-success" },
    reflection: { label: t.journalTypeReflection, icon: Brain, color: "text-warning" },
  } as Record<string, { label: string; icon: typeof Target; color: string }>;
}

function NewEntryDialog({ onCreated }: { onCreated?: () => void }) {
  const create = useCreateJournalEntry();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entryType, setEntryType] = useState("decision");
  const [tagsInput, setTagsInput] = useState("");
  const t = useTranslation(hqCommon);
  const typeConfig = useTypeConfig();

  const handleSubmit = async () => {
    if (!title.trim()) return;
    await create.mutateAsync({
      title: title.trim(), content: content.trim(), entry_type: entryType,
      tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean),
    });
    setTitle(""); setContent(""); setTagsInput(""); setEntryType("decision");
    setOpen(false); onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> {t.journalNewEntry}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{t.journalNewEntryTitle}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <Select value={entryType} onValueChange={setEntryType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(typeConfig).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder={t.journalTitlePlaceholder} value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder={t.journalContentPlaceholder} value={content} onChange={e => setContent(e.target.value)} rows={5} />
          <Input placeholder={t.journalTagsPlaceholder} value={tagsInput} onChange={e => setTagsInput(e.target.value)} />
          <Button onClick={handleSubmit} disabled={!title.trim() || create.isPending} className="w-full gap-2">
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {t.journalAdd}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ImpactDialog({ entry }: { entry: JournalEntry }) {
  const update = useUpdateJournalEntry();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState(entry.impact_measured?.summary || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const t = useTranslation(hqCommon);

  const handleSave = async () => {
    await update.mutateAsync({ id: entry.id, impact_measured: { summary: summary.trim(), date: new Date().toISOString() } });
    setOpen(false);
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("journal-impact", {
        body: { entry_id: entry.id, entry_title: entry.title, entry_content: entry.content, entry_type: entry.entry_type, entry_date: entry.created_at, entry_tags: entry.tags },
      });
      if (error) throw error;
      if (data?.error) { toast({ title: t.journalAIError, description: data.error, variant: "destructive" }); return; }
      setSummary(data.analysis || "");
      toast({ title: t.journalAIDone, description: t.journalAIDoneDesc });
    } catch (e: any) {
      toast({ title: t.error, description: e?.message || t.journalAIFailDesc, variant: "destructive" });
    } finally { setIsAnalyzing(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Sparkles className="h-3 w-3" />
          {entry.impact_measured ? t.journalEditImpact : t.journalMeasureImpact}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{t.journalImpactTitle} — {entry.title}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <Button variant="secondary" className="w-full gap-2" onClick={handleAIAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? <><Loader2 className="h-4 w-4 animate-spin" /> {t.journalAIAnalyzing}</> : <><Brain className="h-4 w-4" /> {t.journalAIAnalyze}</>}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">{t.journalOrManual}</span></div>
          </div>
          <Textarea placeholder={t.journalImpactPlaceholder} value={summary} onChange={e => setSummary(e.target.value)} rows={6} />
          <Button onClick={handleSave} disabled={!summary.trim() || update.isPending} className="w-full">{t.journalSaveImpact}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EntryCard({ entry }: { entry: JournalEntry }) {
  const update = useUpdateJournalEntry();
  const remove = useDeleteJournalEntry();
  const typeConfig = useTypeConfig();
  const { language } = useLanguage();
  const t = useTranslation(hqCommon);
  const config = typeConfig[entry.entry_type] || typeConfig.note;
  const Icon = config.icon;
  const dateFnsLocale = DATE_LOCALES[language] || fr;

  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background ${config.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="w-px flex-1 bg-border" />
      </div>
      <Card className={`card-executive flex-1 mb-4 ${entry.is_pinned ? "border-primary/30 bg-primary/[0.02]" : ""}`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant="outline" className="text-[10px]">{config.label}</Badge>
                {entry.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(entry.created_at), "d MMM yyyy 'à' HH:mm", { locale: dateFnsLocale })}
                </span>
              </div>
              <h3 className="font-semibold text-sm">{entry.title}</h3>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => update.mutateAsync({ id: entry.id, is_pinned: !entry.is_pinned })}>
                {entry.is_pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove.mutateAsync(entry.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          {entry.content && <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{entry.content}</p>}
          {entry.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {entry.tags.map(tag => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
            </div>
          )}
          {entry.impact_measured && (
            <div className="rounded-lg border border-success/30 bg-success/5 p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-success" />
                <span className="text-xs font-semibold text-success">{t.journalImpactMeasured}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {entry.impact_measured.date && formatDistanceToNow(new Date(entry.impact_measured.date), { addSuffix: true, locale: dateFnsLocale })}
                </span>
              </div>
              <p className="text-xs text-foreground/80">{entry.impact_measured.summary}</p>
            </div>
          )}
          <ImpactDialog entry={entry} />
        </CardContent>
      </Card>
    </div>
  );
}

function LiveKPIStrip() {
  const { data: stripeData, isError } = useStripeKPIs();
  const { data: platforms } = usePlatforms();
  const t = useTranslation(hqCommon);

  const mrr = isError ? null : (stripeData?.kpis?.mrr ?? 0);
  const clients = isError ? null : (stripeData?.kpis?.totalCustomers ?? 0);
  const uptime = platforms?.length
    ? Math.round((platforms.reduce((s, p) => s + (p.uptime_percent || 0), 0) / Math.max(platforms.length, 1)) * 10) / 10
    : null;

  return (
    <Card className="card-executive">
      <CardContent className="p-4">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3">{t.journalKPIs}</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-lg font-bold">{mrr != null && mrr > 0 ? formatCurrency(mrr) : "—"}</p><p className="text-[10px] text-muted-foreground">MRR</p></div>
          <div><p className="text-lg font-bold">{clients ?? "—"}</p><p className="text-[10px] text-muted-foreground">{t.journalActiveClients}</p></div>
          <div><p className="text-lg font-bold">{uptime != null ? `${uptime}%` : "—"}</p><p className="text-[10px] text-muted-foreground">Uptime</p></div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function JournalPage() {
  const { data: entries, isLoading } = useJournalEntries();
  const [filter, setFilter] = useState<string>("all");
  const t = useTranslation(hqCommon);
  const typeConfig = useTypeConfig();

  const filtered = entries?.filter(e => filter === "all" || e.entry_type === filter) || [];
  const pinnedCount = entries?.filter(e => e.is_pinned).length || 0;
  const totalCount = entries?.length || 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <ExecutiveHeader
        title={t.journalTitle}
        subtitle={`${totalCount} ${totalCount > 1 ? t.journalEntriesPlural : t.journalEntries} · ${pinnedCount} ${pinnedCount > 1 ? t.journalPinnedPlural : t.journalPinned}`}
        source={{ source: "supabase", confidence: "high" }}
        actions={
          <div className="flex gap-2">
            <JournalPDFExport entries={filtered} />
            <NewEntryDialog />
          </div>
        }
      />
      <LiveKPIStrip />
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "decision", "note", "milestone", "reflection"].map(ty => (
          <Button key={ty} variant={filter === ty ? "default" : "outline"} size="sm" className="text-xs" onClick={() => setFilter(ty)}>
            {ty === "all" ? t.journalFilterAll : typeConfig[ty]?.label || ty}
          </Button>
        ))}
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card className="card-executive border-dashed">
          <CardContent className="p-8 text-center">
            <StickyNote className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">{t.journalEmpty}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">{t.journalEmptyHint}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="pl-1">{filtered.map(entry => <EntryCard key={entry.id} entry={entry} />)}</div>
      )}
    </div>
  );
}
