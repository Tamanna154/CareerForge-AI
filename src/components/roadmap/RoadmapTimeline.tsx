import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Roadmap, RoadmapPhase } from "@/pages/Roadmap";
import { 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  Trophy, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Target,
  Sparkles,
  Download
} from "lucide-react";

interface RoadmapTimelineProps {
  roadmap: Roadmap;
  onReset: () => void;
}

export function RoadmapTimeline({ roadmap, onReset }: RoadmapTimelineProps) {
  const [expandedPhases, setExpandedPhases] = useState<number[]>([1]);

  const togglePhase = (id: number) => {
    setExpandedPhases(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const getPhaseColor = (index: number) => {
    const colors = [
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-orange-500 to-yellow-500",
      "from-green-500 to-emerald-500",
      "from-red-500 to-rose-500",
      "from-indigo-500 to-violet-500",
      "from-teal-500 to-cyan-500",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={onReset} className="mb-4">
          <ArrowLeft className="w-4 h-4" />
          Generate New Roadmap
        </Button>
        
        <Card className="glass-strong border-border/50 overflow-hidden">
          <div className="bg-gradient-primary p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {roadmap.title}
                </h1>
                <p className="text-white/80 text-sm md:text-base mb-4">
                  {roadmap.summary}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    <Clock className="w-3 h-3 mr-1" />
                    {roadmap.totalDuration}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {roadmap.phases.length} Phases
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />

        {/* Phases */}
        <div className="space-y-6">
          {roadmap.phases.map((phase, index) => (
            <PhaseCard 
              key={phase.id}
              phase={phase}
              index={index}
              isExpanded={expandedPhases.includes(phase.id)}
              onToggle={() => togglePhase(phase.id)}
              colorClass={getPhaseColor(index)}
            />
          ))}
        </div>

        {/* Completion */}
        <div className="relative mt-8 ml-6 md:ml-8 pl-8 md:pl-10">
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
            <Trophy className="w-6 h-6 text-primary-foreground" />
          </div>
          <Card className="glass-strong border-primary/30">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold text-gradient mb-2">Goal Achieved! 🎉</h3>
              <p className="text-muted-foreground">
                Complete all phases to master your goal
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface PhaseCardProps {
  phase: RoadmapPhase;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  colorClass: string;
}

function PhaseCard({ phase, index, isExpanded, onToggle, colorClass }: PhaseCardProps) {
  return (
    <div className="relative ml-6 md:ml-8 pl-8 md:pl-10">
      {/* Timeline Node */}
      <div className={`absolute left-0 top-6 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg text-white font-bold`}>
        {index + 1}
      </div>

      <Card 
        className={`glass-strong border-border/50 overflow-hidden transition-all cursor-pointer hover:border-primary/30 ${
          isExpanded ? "ring-2 ring-primary/20" : ""
        }`}
        onClick={onToggle}
      >
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 md:p-6 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {phase.duration}
                </Badge>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">{phase.title}</h3>
              <p className="text-muted-foreground text-sm">{phase.description}</p>
            </div>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="border-t border-border/50 p-4 md:p-6 space-y-6 animate-fade-in">
              {/* Topics */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Topics to Learn
                </h4>
                <div className="flex flex-wrap gap-2">
                  {phase.topics.map((topic, i) => (
                    <Badge key={i} variant="secondary" className="text-sm">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Recommended Resources
                </h4>
                <div className="space-y-2">
                  {phase.resources.map((resource, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs capitalize">
                          {resource.type}
                        </Badge>
                        <span className="text-sm">{resource.name}</span>
                      </div>
                      {resource.url && (
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestone */}
              <div className={`p-4 rounded-lg bg-gradient-to-r ${colorClass} bg-opacity-10`}>
                <h4 className="font-medium mb-2 flex items-center gap-2 text-white">
                  <Trophy className="w-4 h-4" />
                  Milestone
                </h4>
                <p className="text-white/90 text-sm">{phase.milestone}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
