import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Briefcase,
  AlertTriangle,
  Lock,
  Unlock,
  DollarSign,
  ChevronRight,
  Layers,
} from "lucide-react";
import {
  type COSProject,
  type ProjectStatus,
  PROJECT_STATUS_CONFIG,
  COS_RULES,
} from "@/lib/cos-types";
import { cn } from "@/lib/utils";

interface COSPortfolioProps {
  projects: COSProject[];
  activeCount: number;
  canActivate: boolean;
  hasCashFirst: boolean;
  onStatusChange: (projectId: string, status: ProjectStatus) => void;
  onToggleCashFirst: (projectId: string) => void;
  onUpdateProject: (projectId: string, updates: Partial<COSProject>) => void;
}

export function COSPortfolio({
  projects,
  activeCount,
  canActivate,
  hasCashFirst,
  onStatusChange,
  onToggleCashFirst,
  onUpdateProject,
}: COSPortfolioProps) {
  const [editingProject, setEditingProject] = useState<COSProject | null>(null);
  const [pauseDialog, setPauseDialog] = useState<{ open: boolean; targetId: string; targetStatus: ProjectStatus } | null>(null);

  const grouped = {
    actif: projects.filter((p) => p.status === "actif"),
    en_lancement: projects.filter((p) => p.status === "en_lancement"),
    monetise: projects.filter((p) => p.status === "monetise"),
    incubation: projects.filter((p) => p.status === "incubation"),
    maintenance: projects.filter((p) => p.status === "maintenance"),
  };

  const handleStatusChange = (projectId: string, newStatus: ProjectStatus) => {
    if (newStatus === "actif" && !canActivate) {
      // Force a pause decision
      setPauseDialog({ open: true, targetId: projectId, targetStatus: newStatus });
      return;
    }
    onStatusChange(projectId, newStatus);
  };

  const handlePauseAndActivate = (projectToPauseId: string) => {
    if (!pauseDialog) return;
    onStatusChange(projectToPauseId, "incubation");
    onStatusChange(pauseDialog.targetId, pauseDialog.targetStatus);
    setPauseDialog(null);
  };

  return (
    <>
      <Card className="card-executive">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Portfolio COS
              </CardTitle>
              <CardDescription>
                {activeCount}/{COS_RULES.MAX_ACTIVE_PROJECTS} projets actifs
                {!hasCashFirst && activeCount > 0 && (
                  <span className="text-destructive ml-2 font-medium">
                    Aucun projet cash-first
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant={activeCount <= COS_RULES.MAX_ACTIVE_PROJECTS ? "default" : "destructive"}>
                WIP: {activeCount}/{COS_RULES.MAX_ACTIVE_PROJECTS}
              </Badge>
              {hasCashFirst ? (
                <Badge variant="outline" className="border-emerald-500 text-emerald-500">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Cash-first OK
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Cash-first manquant
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {(Object.entries(grouped) as [ProjectStatus, COSProject[]][]).map(([status, items]) => {
            if (items.length === 0) return null;
            const config = PROJECT_STATUS_CONFIG[status];
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("h-2 w-2 rounded-full", config.bgColor.replace("/10", ""))} />
                  <span className={cn("text-sm font-semibold uppercase tracking-wider", config.color)}>
                    {config.label}
                  </span>
                  <span className="text-xs text-muted-foreground">({items.length})</span>
                </div>
                <div className="space-y-2">
                  {items.map((project) => (
                    <div
                      key={project.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-muted/30",
                        config.borderColor
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{project.name}</span>
                            {project.isCashFirst && (
                              <Badge variant="outline" className="border-emerald-500 text-emerald-500 text-xs shrink-0">
                                <DollarSign className="h-2.5 w-2.5 mr-0.5" />
                                Cash-first
                              </Badge>
                            )}
                          </div>
                          {project.promesse && (
                            <span className="text-xs text-muted-foreground truncate">
                              {project.promesse}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {project.status === "actif" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleCashFirst(project.id)}
                            title={project.isCashFirst ? "Retirer cash-first" : "Marquer cash-first"}
                          >
                            {project.isCashFirst ? (
                              <Lock className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Unlock className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </Button>
                        )}
                        <Select
                          value={project.status}
                          onValueChange={(v) => handleStatusChange(project.id, v as ProjectStatus)}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="incubation">Incubation</SelectItem>
                            <SelectItem value="actif">Actif</SelectItem>
                            <SelectItem value="en_lancement">En lancement</SelectItem>
                            <SelectItem value="monetise">Monetise</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingProject(project)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {projects.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Layers className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Aucun projet. Initialisez le portfolio.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pause Dialog - forced when WIP limit hit */}
      <Dialog open={!!pauseDialog?.open} onOpenChange={() => setPauseDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Limite WIP atteinte
            </DialogTitle>
            <DialogDescription>
              2 projets sont deja actifs. Quel projet mettez-vous en pause ?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 my-4">
            {projects
              .filter((p) => p.status === "actif")
              .map((p) => (
                <Button
                  key={p.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handlePauseAndActivate(p.id)}
                >
                  Mettre en pause : <span className="font-bold ml-1">{p.name}</span>
                </Button>
              ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPauseDialog(null)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurer : {editingProject?.name}</DialogTitle>
            <DialogDescription>Definition of Done - chaque champ est obligatoire pour "livre"</DialogDescription>
          </DialogHeader>
          {editingProject && (
            <div className="space-y-4 my-4">
              <div>
                <label className="text-sm font-medium">Promesse (ce que ca resout)</label>
                <Input
                  value={editingProject.promesse}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, promesse: e.target.value })
                  }
                  placeholder="Ex: Reduire le burnout des soignants"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Utilisateur cible</label>
                <Input
                  value={editingProject.cibleUtilisateur}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, cibleUtilisateur: e.target.value })
                  }
                  placeholder="Ex: Etudiants en medecine P2-D4"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Action unique (acheter / s'inscrire / reserver / demo)</label>
                <Input
                  value={editingProject.actionUnique}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, actionUnique: e.target.value })
                  }
                  placeholder="Ex: S'inscrire au plan premium"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mecanisme de livraison</label>
                <Input
                  value={editingProject.mecanismeLivraison}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, mecanismeLivraison: e.target.value })
                  }
                  placeholder="Ex: App web + onboarding email automatise"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingProject(null)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (editingProject) {
                  onUpdateProject(editingProject.id, {
                    promesse: editingProject.promesse,
                    cibleUtilisateur: editingProject.cibleUtilisateur,
                    actionUnique: editingProject.actionUnique,
                    mecanismeLivraison: editingProject.mecanismeLivraison,
                  });
                  setEditingProject(null);
                }
              }}
            >
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
