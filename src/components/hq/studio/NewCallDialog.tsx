import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useCreateStudioCall } from "@/hooks/useStudio";
import { CALL_TYPE_LABEL, type StudioCallType } from "@/lib/studio-types";
import { useToast } from "@/hooks/use-toast";

const callSchema = z.object({
  title: z.string().trim().min(1, "Titre requis").max(280),
  call_type: z.enum([
    "appel_a_projets",
    "appel_offres",
    "ami",
    "subvention",
    "concours",
    "marche_public",
    "marche_prive",
  ]),
  issuer: z.string().trim().max(180).optional(),
  source_url: z.string().trim().url("URL invalide").max(500).optional().or(z.literal("")),
  deadline: z.string().trim().optional(),
  domain: z.string().trim().max(120).optional(),
  eligibility: z.string().trim().max(2000).optional(),
  estimated_budget: z.string().trim().max(120).optional(),
});

interface NewCallDialogProps {
  trigger?: React.ReactNode;
}

export function NewCallDialog({ trigger }: NewCallDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [callType, setCallType] = useState<StudioCallType>("appel_a_projets");
  const [issuer, setIssuer] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [deadline, setDeadline] = useState("");
  const [domain, setDomain] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [budget, setBudget] = useState("");
  const create = useCreateStudioCall();
  const { toast } = useToast();

  const reset = () => {
    setTitle("");
    setCallType("appel_a_projets");
    setIssuer("");
    setSourceUrl("");
    setDeadline("");
    setDomain("");
    setEligibility("");
    setBudget("");
  };

  const handleSubmit = async () => {
    const parsed = callSchema.safeParse({
      title,
      call_type: callType,
      issuer: issuer || undefined,
      source_url: sourceUrl || undefined,
      deadline: deadline || undefined,
      domain: domain || undefined,
      eligibility: eligibility || undefined,
      estimated_budget: budget || undefined,
    });
    if (!parsed.success) {
      toast({
        title: "Validation",
        description: parsed.error.issues[0]?.message ?? "Champs invalides",
        variant: "destructive",
      });
      return;
    }
    await create.mutateAsync({
      title: parsed.data.title,
      call_type: parsed.data.call_type,
      issuer: parsed.data.issuer ?? null,
      source_url: parsed.data.source_url ? parsed.data.source_url : null,
      deadline: parsed.data.deadline ? parsed.data.deadline : null,
      domain: parsed.data.domain ?? null,
      eligibility: parsed.data.eligibility ?? null,
      estimated_budget: parsed.data.estimated_budget ?? null,
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Ajouter un appel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvel appel à projets</DialogTitle>
          <DialogDescription>
            Centralisez les appels d'offres, AMI, subventions et marchés publics ou privés. L'analyse stratégique pourra être lancée ensuite.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="call-title">Titre</Label>
            <Input id="call-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="call-type">Type</Label>
              <Select value={callType} onValueChange={(v) => setCallType(v as StudioCallType)}>
                <SelectTrigger id="call-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(CALL_TYPE_LABEL) as [StudioCallType, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="call-deadline">Échéance</Label>
              <Input
                id="call-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="call-issuer">Émetteur</Label>
              <Input id="call-issuer" value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="ARS, ADEME, BPI…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="call-domain">Domaine</Label>
              <Input id="call-domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="Santé, IA, énergie…" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="call-url">Lien</Label>
            <Input id="call-url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://…" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="call-budget">Budget estimé</Label>
            <Input id="call-budget" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Ex. 120 000 €" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="call-eligibility">Éligibilité / critères</Label>
            <Textarea
              id="call-eligibility"
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              rows={3}
              placeholder="Critères clés, livrables attendus, partenaires requis…"
            />
          </div>
          <Button onClick={handleSubmit} disabled={!title.trim() || create.isPending} className="w-full gap-2">
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Ajouter l'appel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
