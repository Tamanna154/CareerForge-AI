import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Target, 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  Clock,
  Award,
  ChevronRight,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface InterviewHistory {
  id: string;
  date: Date;
  type: string;
  role: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
}

export default function Dashboard() {
  const [history, setHistory] = useState<InterviewHistory[]>([]);

  useEffect(() => {
    // Load interview history from localStorage
    const saved = localStorage.getItem("interview_history");
    if (saved) {
      const parsed = JSON.parse(saved);
      setHistory(parsed.map((h: any) => ({ ...h, date: new Date(h.date) })));
    }
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 85) return "success";
    if (score >= 70) return "info";
    if (score >= 50) return "warning";
    return "destructive";
  };

  const averageScore = history.length > 0
    ? Math.round(history.reduce((sum, h) => sum + h.overallScore, 0) / history.length)
    : 0;

  const totalInterviews = history.length;
  const bestScore = history.length > 0 ? Math.max(...history.map(h => h.overallScore)) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 p-4 pb-12">
        <div className="container mx-auto max-w-6xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="font-display text-4xl font-bold">Progress Dashboard</h1>
            <p className="text-muted-foreground">Track your interview performance and improvement over time</p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card variant="glass" className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <p className="text-3xl font-bold text-gradient">{totalInterviews}</p>
              <p className="text-sm text-muted-foreground">Total Interviews</p>
            </Card>

            <Card variant="glass" className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <p className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>{averageScore}%</p>
              <p className="text-sm text-muted-foreground">Average Score</p>
            </Card>

            <Card variant="glass" className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-warning" />
              </div>
              <p className={`text-3xl font-bold ${getScoreColor(bestScore)}`}>{bestScore}%</p>
              <p className="text-sm text-muted-foreground">Best Score</p>
            </Card>

            <Card variant="glass" className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-info/20 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-info" />
              </div>
              <p className="text-3xl font-bold text-info">
                {history.filter(h => h.overallScore >= 80).length}
              </p>
              <p className="text-sm text-muted-foreground">High Scores (80+)</p>
            </Card>
          </div>

          {/* Interview History */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Interview History
              </CardTitle>
              <CardDescription>Your recent interview sessions and scores</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg">No interviews yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Start your first mock interview to begin tracking your progress
                  </p>
                  <Link to="/interview">
                    <Button variant="hero">
                      Start Interview
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.slice().reverse().map((interview) => (
                    <div 
                      key={interview.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-6 h-6 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium">{interview.role}</h4>
                          <Badge variant="outline">{interview.type}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {interview.date.toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {interview.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Technical</p>
                            <p className={`font-bold ${getScoreColor(interview.technicalScore)}`}>
                              {interview.technicalScore}%
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Communication</p>
                            <p className={`font-bold ${getScoreColor(interview.communicationScore)}`}>
                              {interview.communicationScore}%
                            </p>
                          </div>
                        </div>
                        
                        <Badge variant={getScoreBadgeVariant(interview.overallScore) as any} className="text-lg px-3 py-1">
                          {interview.overallScore}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Overview */}
          {history.length > 0 && (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Skills Overview
                </CardTitle>
                <CardDescription>Your average performance across different skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { 
                    label: "Technical Knowledge", 
                    score: Math.round(history.reduce((s, h) => s + h.technicalScore, 0) / history.length),
                    icon: Brain 
                  },
                  { 
                    label: "Communication Skills", 
                    score: Math.round(history.reduce((s, h) => s + h.communicationScore, 0) / history.length),
                    icon: MessageSquare 
                  },
                ].map((skill, index) => {
                  const Icon = skill.icon;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-primary" />
                          <span className="font-medium">{skill.label}</span>
                        </div>
                        <span className={`font-bold ${getScoreColor(skill.score)}`}>
                          {skill.score}%
                        </span>
                      </div>
                      <Progress value={skill.score} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* CTA */}
          <div className="text-center">
            <Link to="/interview">
              <Button variant="hero" size="lg">
                Start New Interview
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
