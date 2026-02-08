import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RunTemplate, 
  getAllTemplates, 
  getTemplatesByCategory,
  TEMPLATE_CATEGORY_LABELS,
  processTemplatePrompt,
} from "@/lib/run-templates";
import { useRunQueue } from "@/hooks/useRunQueue";
import { 
  Sparkles, 
  Play, 
  Loader2,
  Settings2,
  FileText,
  Target,
  TrendingUp,
  DollarSign,
  Wrench,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS = {
  strategic: Target,
  operational: Settings2,
  technical: Wrench,
  marketing: TrendingUp,
  finance: DollarSign,
  custom: FileText,
};

interface RunTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedTemplate?: string;
}

export function RunTemplateDialog({ open, onOpenChange, preselectedTemplate }: RunTemplateDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<RunTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  
  const { enqueue } = useRunQueue();
  const templates = getAllTemplates();
  
  // Platform options for platform-type variables
  const platformOptions = [
    { value: "emotionscare", label: "EmotionsCare" },
    { value: "nearvity", label: "NEARVITY" },
    { value: "system-compass", label: "System Compass" },
    { value: "growth-copilot", label: "Growth Copilot" },
    { value: "med-mng", label: "Med MNG" },
  ];

  const handleTemplateSelect = (template: RunTemplate) => {
    setSelectedTemplate(template);
    // Initialize variables with defaults
    const defaults: Record<string, string> = {};
    template.variables.forEach(v => {
      defaults[v.key] = v.defaultValue || "";
    });
    setVariables(defaults);
  };

  const handleExecute = async () => {
    if (!selectedTemplate) return;
    
    setIsExecuting(true);
    
    try {
      // Process the template with variables
      const processedPrompt = processTemplatePrompt(
        selectedTemplate.userPromptTemplate,
        variables
      );
      
      // Add to queue
      enqueue(
        selectedTemplate.id.toUpperCase(),
        variables.platform || variables.platformFilter,
        {
          templateId: selectedTemplate.id,
          variables,
          processedPrompt,
          systemPrompt: selectedTemplate.systemPrompt,
        }
      );
      
      onOpenChange(false);
      setSelectedTemplate(null);
      setVariables({});
    } finally {
      setIsExecuting(false);
    }
  };

  const renderVariableInput = (variable: RunTemplate["variables"][0]) => {
    const value = variables[variable.key] || "";
    
    switch (variable.type) {
      case "select":
        return (
          <Select value={value} onValueChange={(v) => setVariables(prev => ({ ...prev, [variable.key]: v }))}>
            <SelectTrigger>
              <SelectValue placeholder={`Sélectionner ${variable.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {variable.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "platform":
        return (
          <Select value={value} onValueChange={(v) => setVariables(prev => ({ ...prev, [variable.key]: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une plateforme" />
            </SelectTrigger>
            <SelectContent>
              {platformOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "date":
        return (
          <Input 
            type="date" 
            value={value}
            onChange={(e) => setVariables(prev => ({ ...prev, [variable.key]: e.target.value }))}
          />
        );
      
      default:
        return (
          <Input 
            value={value}
            onChange={(e) => setVariables(prev => ({ ...prev, [variable.key]: e.target.value }))}
            placeholder={`Entrer ${variable.label.toLowerCase()}`}
          />
        );
    }
  };

  const isValid = selectedTemplate?.variables.every(v => 
    !v.required || variables[v.key]?.trim()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Lancer un Run IA
          </DialogTitle>
          <DialogDescription>
            Sélectionnez un template et configurez les paramètres
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Template Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Templates disponibles</h3>
            <Tabs defaultValue="strategic" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="strategic">Stratégique</TabsTrigger>
                <TabsTrigger value="operational">Opérationnel</TabsTrigger>
                <TabsTrigger value="other">Autres</TabsTrigger>
              </TabsList>
              
              <TabsContent value="strategic" className="mt-2">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {[...getTemplatesByCategory("strategic"), ...getTemplatesByCategory("finance")].map(template => (
                      <TemplateCard 
                        key={template.id}
                        template={template}
                        selected={selectedTemplate?.id === template.id}
                        onClick={() => handleTemplateSelect(template)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="operational" className="mt-2">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {[...getTemplatesByCategory("operational"), ...getTemplatesByCategory("technical")].map(template => (
                      <TemplateCard 
                        key={template.id}
                        template={template}
                        selected={selectedTemplate?.id === template.id}
                        onClick={() => handleTemplateSelect(template)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="other" className="mt-2">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {[...getTemplatesByCategory("marketing"), ...getTemplatesByCategory("custom")].map(template => (
                      <TemplateCard 
                        key={template.id}
                        template={template}
                        selected={selectedTemplate?.id === template.id}
                        onClick={() => handleTemplateSelect(template)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Configuration */}
          <div className="space-y-3 border-l pl-4">
            <h3 className="font-semibold text-sm">Configuration</h3>
            
            {selectedTemplate ? (
              <div className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium">{selectedTemplate.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedTemplate.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="subtle">{TEMPLATE_CATEGORY_LABELS[selectedTemplate.category]}</Badge>
                    <Badge variant={selectedTemplate.riskLevel === "low" ? "subtle" : "gold"}>
                      Risque {selectedTemplate.riskLevel}
                    </Badge>
                  </div>
                </div>
                
                {selectedTemplate.variables.length > 0 ? (
                  <ScrollArea className="h-[220px]">
                    <div className="space-y-4 pr-4">
                      {selectedTemplate.variables.map(variable => (
                        <div key={variable.key} className="space-y-2">
                          <Label htmlFor={variable.key}>
                            {variable.label}
                            {variable.required && <span className="text-destructive ml-1">*</span>}
                          </Label>
                          {renderVariableInput(variable)}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune configuration requise</p>
                    <p className="text-xs">Ce template peut être lancé directement</p>
                  </div>
                )}
                
                {/* Data sources */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Sources de données:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.dataSources.useGitHub && <Badge variant="subtle">GitHub</Badge>}
                    {selectedTemplate.dataSources.usePerplexity && <Badge variant="subtle">Perplexity</Badge>}
                    {selectedTemplate.dataSources.useFirecrawl && <Badge variant="subtle">Firecrawl</Badge>}
                    {selectedTemplate.dataSources.useStripe && <Badge variant="subtle">Stripe</Badge>}
                    <Badge variant="subtle">Lovable AI</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <ChevronRight className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sélectionnez un template</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleExecute}
            disabled={!selectedTemplate || !isValid || isExecuting}
          >
            {isExecuting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Lancement...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Lancer le Run
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TemplateCard({ 
  template, 
  selected, 
  onClick 
}: { 
  template: RunTemplate; 
  selected: boolean;
  onClick: () => void;
}) {
  const CategoryIcon = CATEGORY_ICONS[template.category];
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 rounded-lg border text-left transition-all hover:border-primary/50",
        selected && "border-primary bg-primary/5"
      )}
    >
      <div className="flex items-start gap-2">
        <CategoryIcon className={cn(
          "h-4 w-4 mt-0.5",
          selected ? "text-primary" : "text-muted-foreground"
        )} />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{template.name}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {template.description}
          </p>
        </div>
      </div>
    </button>
  );
}
