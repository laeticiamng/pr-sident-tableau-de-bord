import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Loader2, CheckCircle2 } from "lucide-react";

interface Props { triggerLabel?: string; triggerIcon?: React.ReactNode }

export function PublicSubmissionDialog({ triggerLabel = "Proposer une problématique", triggerIcon }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({
    contact_name: "", contact_email: "", contact_org: "", contact_role: "",
    domain: "", problem_statement: "", context: "", desired_outcome: "", website: "",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!form.contact_name.trim() || !form.contact_email.trim() || form.problem_statement.trim().length < 10) {
      toast({ title: "Champs requis", description: "Nom, email et description (10+ caractères) sont obligatoires.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/studio-public-submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 429) {
        toast({ title: "Trop de soumissions", description: "Réessayez dans une heure.", variant: "destructive" });
        return;
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Erreur d'envoi");
      }
      setDone(true);
    } catch (err) {
      toast({ title: "Erreur", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setDone(false); } }}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          {triggerIcon ?? <Lightbulb className="h-4 w-4" />} {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Soumettre une problématique au Studio</DialogTitle>
          <DialogDescription>
            Décrivez votre projet ou problème complexe. Notre équipe vous répond sous 48h.
          </DialogDescription>
        </DialogHeader>
        {done ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="h-12 w-12 mx-auto text-success" />
            <p className="font-semibold">Merci, votre soumission est bien arrivée.</p>
            <p className="text-sm text-muted-foreground">Nous vous répondrons par email sous 48h.</p>
            <Button onClick={() => setOpen(false)}>Fermer</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            {/* Honeypot */}
            <input
              type="text" name="website" autoComplete="off" tabIndex={-1}
              value={form.website} onChange={update("website")}
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
              aria-hidden="true"
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label htmlFor="cn">Nom *</Label><Input id="cn" required value={form.contact_name} onChange={update("contact_name")} maxLength={200} /></div>
              <div><Label htmlFor="ce">Email *</Label><Input id="ce" required type="email" value={form.contact_email} onChange={update("contact_email")} maxLength={320} /></div>
              <div><Label htmlFor="co">Organisation</Label><Input id="co" value={form.contact_org} onChange={update("contact_org")} maxLength={200} /></div>
              <div><Label htmlFor="cr">Rôle</Label><Input id="cr" value={form.contact_role} onChange={update("contact_role")} maxLength={200} /></div>
            </div>
            <div><Label htmlFor="dm">Domaine</Label><Input id="dm" placeholder="Santé, IA, Énergie…" value={form.domain} onChange={update("domain")} maxLength={100} /></div>
            <div><Label htmlFor="pb">Problématique *</Label><Textarea id="pb" required rows={4} value={form.problem_statement} onChange={update("problem_statement")} maxLength={5000} placeholder="Décrivez le problème complexe à résoudre…" /></div>
            <div><Label htmlFor="ctx">Contexte</Label><Textarea id="ctx" rows={3} value={form.context} onChange={update("context")} maxLength={5000} placeholder="Acteurs, contraintes, historique…" /></div>
            <div><Label htmlFor="dout">Résultat souhaité</Label><Textarea id="dout" rows={2} value={form.desired_outcome} onChange={update("desired_outcome")} maxLength={2000} /></div>
            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Envoyer la soumission
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              Vos données sont traitées confidentiellement par EMOTIONSCARE SASU.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}