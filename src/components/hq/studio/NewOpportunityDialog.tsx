import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
import { useCreateStudioOpportunity } from "@/hooks/useStudio";
import { useToast } from "@/hooks/use-toast";

const SOURCE_TYPES = [
  { value: "veille", label: "Veille interne" },
  { value: "ami", label: "AMI / Appel à manifestation" },
  { value: "appel_projets", label: "Appel à projets" },
  { value: "appel_offres", label: "Appel d'offres" },
  { value: "demande_client", label: "Demande client" },
  { value: "demande_institution", label: "Demande institutionnelle" },
  { value: "demande_collectivite", label: "Demande collectivité" },
  { value: "porteur_projet", label: "Porteur de projet" },
  { value: "interne", label: "Détection interne" },
];

const opportunitySchema = z.object({
  title: z.string().trim().min(1, "Titre requis").max(280, "Titre trop long"),
  domain: z.string().trim().max(120).optional(),
  source_type: z.string().trim().max(60).optional(),
  source_url: z.string().trim().url("URL invalide").max(500).optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional(),
  problem_statement: z.string().trim().max(4000).optional(),
});

interface NewOpportunityDialogProps {
  trigger?: React.ReactNode;
}

export function NewOpportunityDialog({ trigger }: NewOpportunityDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [sourceType, setSourceType] = useState<string>("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [description, setDescription] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const create = useCreateStudioOpportunity();
  const { toast } = useToast();

  const reset = () => {
    setTitle("");
    setDomain("");
    setSourceType("");
    setSourceUrl("");
    setDescription("");
    setProblemStatement("");
  };

  const handleSubmit = async () => {
    const parsed = opportunitySchema.safeParse({
      title,
      domain: domain || undefined,
      source_type: sourceType || undefined,
      source_url: sourceUrl || undefined,
      description: description || undefined,
      problem_statement: problemStatement || undefined,
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
      domain: parsed.data.domain ?? null,
      source_type: parsed.data.source_type ?? null,
      source_url: parsed.data.source_url ? parsed.data.source_url : null,
      description: parsed.data.description ?? null,
      problem_statement: parsed.data.problem_statement ?? null,
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Nouvelle opportunité
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle opportunité Studio</DialogTitle>
          <DialogDescription>
            Détectez une problématique complexe ou une opportunité émergente. Vous pourrez ensuite générer un Blueprint 360° et proposer un deal.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="opp-title">Titre</Label>
            <Input
              id="opp-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. Plateforme bien-être pour collectivités"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="opp-domain">Domaine</Label>
              <Input
                id="opp-domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Santé, IA, énergie…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="opp-source-type">Source</Label>
              <Select value={sourceType} onValueChange={setSourceType}>
                <SelectTrigger id="opp-source-type">
                  <SelectValue placeholder="Sélectionner…" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_TYPES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="opp-source-url">URL / référence</Label>
            <Input
              id="opp-source-url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="opp-problem">Problématique</Label>
            <Textarea
              id="opp-problem"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="Quel besoin réel ? Pourquoi est-il urgent ? Pourquoi n'est-il pas encore résolu ?"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="opp-description">Contexte / description</Label>
            <Textarea
              id="opp-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contexte stratégique, cibles potentielles, opportunité de financement…"
              rows={3}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || create.isPending}
            className="w-full gap-2"
          >
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Créer l'opportunité
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
