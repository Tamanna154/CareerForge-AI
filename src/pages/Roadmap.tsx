import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { RoadmapForm } from "@/components/roadmap/RoadmapForm";
import { RoadmapTimeline } from "@/components/roadmap/RoadmapTimeline";
import { FreeResourcesSection } from "@/components/roadmap/FreeResourcesSection";
import { Map, Sparkles, BookOpen, Zap, Target } from "lucide-react";

export interface RoadmapResource {
  name: string;
  type: string;
  url?: string;
  isFree?: boolean;
}

export interface FreeResource {
  name: string;
  type: string;
  url: string;
  description: string;
}

export interface RoadmapPhase {
  id: number;
  title: string;
  duration: string;
  description: string;
  topics: string[];
  resources: RoadmapResource[];
  milestone: string;
}

export interface Roadmap {
  title: string;
  summary: string;
  totalDuration: string;
  phases: RoadmapPhase[];
  freeResources?: FreeResource[];
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong text-sm text-muted-foreground mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              AI-Powered Learning Paths
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Career Roadmap</span> Generator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get a personalized learning roadmap tailored to your goals. Our AI creates 
              step-by-step guides with resources, timelines, and milestones.
            </p>
            
            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-xs text-muted-foreground">
                <Target className="w-3 h-3 text-primary" />
                Personalized Goals
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-xs text-muted-foreground">
                <BookOpen className="w-3 h-3 text-primary" />
                Free Resources
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-xs text-muted-foreground">
                <Zap className="w-3 h-3 text-primary" />
                AI-Generated
              </div>
            </div>
          </div>

          {!roadmap ? (
            <>
              <RoadmapForm 
                onRoadmapGenerated={setRoadmap} 
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
              {/* Show free resources section by default */}
              <div className="max-w-4xl mx-auto">
                <FreeResourcesSection />
              </div>
            </>
          ) : (
            <>
              <RoadmapTimeline 
                roadmap={roadmap} 
                onReset={() => setRoadmap(null)} 
              />
              {/* Show AI-generated free resources if available */}
              <div className="max-w-4xl mx-auto">
                <FreeResourcesSection resources={roadmap.freeResources} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
