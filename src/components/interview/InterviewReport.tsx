import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb, 
  RotateCcw,
  Trophy,
  Target,
  MessageSquare,
  Brain,
  TrendingUp,
  FileText,
  AlertCircle
} from "lucide-react";
import { InterviewReport as ReportType } from "./InterviewSession";
import { Link } from "react-router-dom";

interface InterviewReportProps {
  report: ReportType;
  onRestart: () => void;
}

export function InterviewReportView({ report, onRestart }: InterviewReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return "success";
    if (score >= 70) return "info";
    if (score >= 50) return "warning";
    return "destructive";
  };

  const scores = [
    { label: "Technical Knowledge", score: report.technicalScore, icon: Brain },
    { label: "Communication Skills", score: report.communicationScore, icon: MessageSquare },
    { label: "Problem Solving", score: report.problemSolvingScore, icon: Target },
    { label: "Confidence Level", score: report.confidenceScore, icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen pt-20 p-4 pb-12">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto shadow-glow">
            <Trophy className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold">Interview Complete</h1>
          <p className="text-muted-foreground">Here's your detailed performance analysis</p>
        </div>

        {/* Overall Score */}
        <Card variant="elevated" className="text-center p-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-muted-foreground">Overall Score</h2>
            <div className={`text-7xl font-display font-bold ${getScoreColor(report.overallScore)}`}>
              {report.overallScore}
            </div>
            <Badge variant={getScoreBadge(report.overallScore) as any} className="text-lg px-4 py-1">
              {report.overallScore >= 85 ? "Excellent" : 
               report.overallScore >= 70 ? "Good" : 
               report.overallScore >= 50 ? "Average" : "Needs Improvement"}
            </Badge>
          </div>
        </Card>

        {/* ATS Score Section */}
        {report.atsResult && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                ATS Resume Analysis
              </CardTitle>
              <CardDescription>How your resume performs with Applicant Tracking Systems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">ATS Score</span>
                    <span className={`font-bold ${getScoreColor(report.atsResult.atsScore)}`}>
                      {report.atsResult.atsScore}/100
                    </span>
                  </div>
                  <Progress value={report.atsResult.atsScore} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Role Compatibility</span>
                    <span className={`font-bold ${getScoreColor(report.atsResult.roleCompatibilityScore)}`}>
                      {report.atsResult.roleCompatibilityScore}%
                    </span>
                  </div>
                  <Progress value={report.atsResult.roleCompatibilityScore} className="h-2" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm">Keyword Match</span>
                <Badge variant="outline">{report.atsResult.keywordMatchPercent}%</Badge>
              </div>

              {report.atsResult.missingKeywords.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-warning" />
                    Missing Keywords
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {report.atsResult.missingKeywords.slice(0, 5).map((keyword, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{keyword}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {report.atsResult.improvements.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Resume Improvements</span>
                  <ul className="space-y-1">
                    {report.atsResult.improvements.slice(0, 3).map((tip, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Score Breakdown */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Interview Score Breakdown</CardTitle>
            <CardDescription>Detailed analysis of your performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {scores.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <span className={`font-bold ${getScoreColor(item.score)}`}>
                      {item.score}%
                    </span>
                  </div>
                  <Progress value={item.score} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="w-5 h-5" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Suggestions */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Recommendations
            </CardTitle>
            <CardDescription>Personalized tips to improve your performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {report.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <span className="text-sm">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg" onClick={onRestart}>
            <RotateCcw className="w-4 h-4" />
            Practice Again
          </Button>
          <Link to="/opportunities">
            <Button variant="glass" size="lg">
              Explore Opportunities
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
