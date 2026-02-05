 import { Card, CardContent } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Database, Link2, RefreshCw, AlertTriangle } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 interface EmptyDataStateProps {
   title: string;
   description: string;
   source: string;
   onConnect?: () => void;
   className?: string;
   compact?: boolean;
 }
 
 export function EmptyDataState({ 
   title, 
   description, 
   source, 
   onConnect,
   className,
   compact = false
 }: EmptyDataStateProps) {
   return (
     <Card className={cn("card-executive border-dashed border-2 border-muted-foreground/20", className)}>
       <CardContent className={cn(
         "flex flex-col items-center justify-center text-center",
         compact ? "py-6 px-4" : "py-10 px-6"
       )}>
         <div className="p-3 rounded-full bg-muted/50 mb-3">
           <Database className="h-6 w-6 text-muted-foreground" />
         </div>
         
         <h3 className="text-sm font-semibold text-foreground mb-1">
           {title}
         </h3>
         
         <p className="text-xs text-muted-foreground mb-3 max-w-[250px]">
           {description}
         </p>
         
         <Badge variant="outline" className="text-[10px] mb-4 gap-1">
           <AlertTriangle className="h-2.5 w-2.5" />
           Source requise : {source}
         </Badge>
         
         {onConnect && (
           <Button 
             variant="outline" 
             size="sm" 
             className="text-xs gap-1.5"
             onClick={onConnect}
           >
             <Link2 className="h-3 w-3" />
             Connecter {source}
           </Button>
         )}
       </CardContent>
     </Card>
   );
 }
 
 export function InlineEmptyState({ message }: { message: string }) {
   return (
     <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/20">
       <Database className="h-4 w-4 text-muted-foreground" />
       <span className="text-xs text-muted-foreground">{message}</span>
     </div>
   );
 }