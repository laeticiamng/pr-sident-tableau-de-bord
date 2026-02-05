 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { 
   Rocket, 
   TrendingUp, 
   Brain, 
   Workflow, 
   Users, 
   Target,
   RefreshCcw,
   Download,
   Sparkles
 } from "lucide-react";
 
 // Growth OS Components
 import { GrowthMetricsGrid } from "@/components/hq/growth/GrowthMetricsGrid";
 import { ConversionFunnelWidget } from "@/components/hq/growth/ConversionFunnelWidget";
 import { ChannelAttributionWidget } from "@/components/hq/growth/ChannelAttributionWidget";
 import { RetentionCohortWidget } from "@/components/hq/growth/RetentionCohortWidget";
 import { UserSegmentsWidget } from "@/components/hq/growth/UserSegmentsWidget";
 import { AutomationWorkflowsWidget } from "@/components/hq/growth/AutomationWorkflowsWidget";
 import { AIPredictionsWidget } from "@/components/hq/growth/AIPredictionsWidget";
 import { AIRecommendationsWidget } from "@/components/hq/growth/AIRecommendationsWidget";
 import { GrowthTrendChart } from "@/components/hq/growth/GrowthTrendChart";
 
 export default function GrowthPage() {
   return (
     <div className="space-y-6 animate-fade-in">
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-platform-growth text-white">
               <Rocket className="h-5 w-5" />
             </div>
             <div>
               <h1 className="text-xl sm:text-2xl font-bold text-foreground">Growth OS</h1>
               <p className="text-xs sm:text-sm text-muted-foreground">
                 Intelligence stratégique et pilotage de croissance
               </p>
             </div>
           </div>
         </div>
         
         <div className="flex items-center gap-2">
           <Badge variant="gold" className="text-xs">
             <Sparkles className="h-3 w-3 mr-1" />
             IA Active
           </Badge>
           <Button variant="outline" size="sm" className="text-xs">
             <RefreshCcw className="h-3 w-3 mr-1.5" />
             Actualiser
           </Button>
           <Button variant="outline" size="sm" className="text-xs">
             <Download className="h-3 w-3 mr-1.5" />
             Export
           </Button>
         </div>
       </div>
 
       {/* KPI Metrics Bar */}
       <GrowthMetricsGrid />
 
       {/* Main Tabs */}
       <Tabs defaultValue="overview" className="space-y-4">
         <TabsList className="grid w-full grid-cols-4 h-auto p-1">
           <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">
             <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
             <span className="hidden sm:inline">Vue d'ensemble</span>
             <span className="sm:hidden">Vue</span>
           </TabsTrigger>
           <TabsTrigger value="acquisition" className="text-xs sm:text-sm py-2">
             <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
             <span className="hidden sm:inline">Acquisition</span>
             <span className="sm:hidden">Acq.</span>
           </TabsTrigger>
           <TabsTrigger value="retention" className="text-xs sm:text-sm py-2">
             <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
             <span className="hidden sm:inline">Rétention</span>
             <span className="sm:hidden">Rét.</span>
           </TabsTrigger>
           <TabsTrigger value="intelligence" className="text-xs sm:text-sm py-2">
             <Brain className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
             <span className="hidden sm:inline">Intelligence IA</span>
             <span className="sm:hidden">IA</span>
           </TabsTrigger>
         </TabsList>
 
         {/* Overview Tab */}
         <TabsContent value="overview" className="space-y-4 mt-4">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <GrowthTrendChart />
             <AIPredictionsWidget />
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <ConversionFunnelWidget />
             <AIRecommendationsWidget />
           </div>
         </TabsContent>
 
         {/* Acquisition Tab */}
         <TabsContent value="acquisition" className="space-y-4 mt-4">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <ConversionFunnelWidget />
             <ChannelAttributionWidget />
           </div>
           
           <div className="grid grid-cols-1 gap-4">
             <GrowthTrendChart />
           </div>
         </TabsContent>
 
         {/* Retention Tab */}
         <TabsContent value="retention" className="space-y-4 mt-4">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <RetentionCohortWidget />
             <UserSegmentsWidget />
           </div>
           
           <div className="grid grid-cols-1 gap-4">
             <AutomationWorkflowsWidget />
           </div>
         </TabsContent>
 
         {/* Intelligence Tab */}
         <TabsContent value="intelligence" className="space-y-4 mt-4">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <AIPredictionsWidget />
             <AIRecommendationsWidget />
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <AutomationWorkflowsWidget />
             <UserSegmentsWidget />
           </div>
         </TabsContent>
       </Tabs>
     </div>
   );
 }