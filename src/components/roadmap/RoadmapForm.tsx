import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Roadmap } from "@/pages/Roadmap";
import { 
  Target, 
  GraduationCap, 
  Code, 
  Briefcase, 
  Brain,
  Loader2,
  Rocket
} from "lucide-react";

const goalTypes = [
  { value: "career", label: "Career Goal", icon: Briefcase, description: "Become a Frontend Dev, Data Scientist, etc." },
  { value: "interview", label: "Interview Prep", icon: Brain, description: "DSA, System Design, Behavioral" },
  { value: "skill", label: "Skill-Based", icon: Code, description: "Learn React, Python, Cloud, etc." },
];

const experienceLevels = [
  { value: "beginner", label: "Beginner", description: "New to this field" },
  { value: "intermediate", label: "Intermediate", description: "Some experience" },
  { value: "advanced", label: "Advanced", description: "Looking to specialize" },
];

interface RoadmapFormProps {
  onRoadmapGenerated: (roadmap: Roadmap) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function RoadmapForm({ onRoadmapGenerated, isLoading, setIsLoading }: RoadmapFormProps) {
  const [goal, setGoal] = useState("");
  const [goalType, setGoalType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goal || !goalType || !experienceLevel) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-roadmap', {
        body: { goal, goalType, experienceLevel }
      });

      if (error) {
        throw error;
      }

      if (data.roadmap) {
        onRoadmapGenerated(data.roadmap);
        toast.success("Roadmap generated successfully!");
      } else {
        throw new Error("No roadmap data received");
      }
    } catch (error: any) {
      console.error("Error generating roadmap:", error);
      toast.error(error.message || "Failed to generate roadmap. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="glass-strong border-border/50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4 shadow-glow">
            <Target className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Define Your Goal</CardTitle>
          <CardDescription>
            Tell us what you want to achieve and we'll create a personalized roadmap
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Type Selection */}
            <div className="space-y-3">
              <Label className="text-base">What type of goal is this?</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {goalTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = goalType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setGoalType(type.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Goal Input */}
            <div className="space-y-2">
              <Label htmlFor="goal" className="text-base">Describe your goal</Label>
              <Input
                id="goal"
                placeholder="e.g., Become a Full Stack Developer, Master Data Structures and Algorithms, Learn Cloud Computing..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            {/* Experience Level */}
            <div className="space-y-3">
              <Label className="text-base">Your current experience level</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {experienceLevels.map((level) => {
                  const isSelected = experienceLevel === level.value;
                  return (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setExperienceLevel(level.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="font-medium">{level.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{level.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              variant="hero" 
              size="lg" 
              className="w-full"
              disabled={isLoading || !goal || !goalType || !experienceLevel}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Your Roadmap...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Generate Roadmap
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
