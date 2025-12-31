import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Upload, FileText, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface InterviewConfig {
  name: string;
  branch: string;
  role: string;
  experienceLevel: string;
  interestField: string;
  interviewType: string;
  interviewLevel: string;
  resume: string;
  resumeFileName?: string;
}

export interface ATSResult {
  atsScore: number;
  keywordMatchPercent: number;
  missingKeywords: string[];
  formattingIssues: string[];
  improvements: string[];
  roleCompatibilityScore: number;
  strengths: string[];
  summary: string;
}

interface InterviewSetupProps {
  onSetupComplete: (config: InterviewConfig, atsResult?: ATSResult) => void;
}

export function InterviewSetup({ onSetupComplete }: InterviewSetupProps) {
  const [config, setConfig] = useState<InterviewConfig>({
    name: "",
    branch: "",
    role: "",
    experienceLevel: "",
    interestField: "",
    interviewType: "",
    interviewLevel: "",
    resume: "",
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['text/plain', 'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.txt')) {
      toast.error("Please upload a TXT, PDF, or Word document");
      return;
    }

    // For now, we support text files directly. PDF/Word would need server-side parsing
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text();
      setConfig({ ...config, resume: text, resumeFileName: file.name });
      toast.success("Resume uploaded successfully");
    } else {
      // For PDF/Word, inform user to paste text content
      toast.info("For best results, paste your resume text below. PDF parsing coming soon!");
      setConfig({ ...config, resumeFileName: file.name });
    }
  };

  const analyzeResume = async () => {
    if (!config.resume || config.resume.trim().length < 50) {
      toast.error("Please add more resume content for analysis");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            resumeText: config.resume,
            targetRole: config.role,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to analyze resume");
      }

      const result = await response.json();
      setAtsResult(result);
      toast.success(`ATS Score: ${result.atsScore}/100`);
    } catch (error) {
      console.error("Resume analysis error:", error);
      toast.error("Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSetupComplete(config, atsResult || undefined);
  };

  const clearResume = () => {
    setConfig({ ...config, resume: "", resumeFileName: undefined });
    setAtsResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isFormValid = config.name && config.branch && config.role && 
    config.experienceLevel && config.interestField && 
    config.interviewType && config.interviewLevel;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20">
      <Card variant="elevated" className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Interview Configuration</CardTitle>
          <CardDescription className="text-base">
            Tell us about yourself so we can personalize your interview experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
              />
            </div>

            {/* Branch & Role */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch / Degree</Label>
                <Select
                  value={config.branch}
                  onValueChange={(value) => setConfig({ ...config, branch: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cse">Computer Science</SelectItem>
                    <SelectItem value="it">Information Technology</SelectItem>
                    <SelectItem value="ece">Electronics & Communication</SelectItem>
                    <SelectItem value="ee">Electrical Engineering</SelectItem>
                    <SelectItem value="me">Mechanical Engineering</SelectItem>
                    <SelectItem value="ce">Civil Engineering</SelectItem>
                    <SelectItem value="mba">MBA</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role Applied For</Label>
                <Input
                  id="role"
                  placeholder="e.g., Software Developer"
                  value={config.role}
                  onChange={(e) => setConfig({ ...config, role: e.target.value })}
                />
              </div>
            </div>

            {/* Experience & Interest */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select
                  value={config.experienceLevel}
                  onValueChange={(value) => setConfig({ ...config, experienceLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fresher">Fresher</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                    <SelectItem value="experienced">Experienced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Field of Interest</Label>
                <Select
                  value={config.interestField}
                  onValueChange={(value) => setConfig({ ...config, interestField: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web Development</SelectItem>
                    <SelectItem value="ai">AI / Machine Learning</SelectItem>
                    <SelectItem value="data">Data Science</SelectItem>
                    <SelectItem value="mobile">Mobile Development</SelectItem>
                    <SelectItem value="cloud">Cloud Computing</SelectItem>
                    <SelectItem value="core">Core Engineering</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Interview Type & Level */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Interview Type</Label>
                <Select
                  value={config.interviewType}
                  onValueChange={(value) => setConfig({ ...config, interviewType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="coding">Coding Round</SelectItem>
                    <SelectItem value="phone">Phone Screen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Interview Level</Label>
                <Select
                  value={config.interviewLevel}
                  onValueChange={(value) => setConfig({ ...config, interviewLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Resume Upload */}
            <div className="space-y-3">
              <Label>Resume Upload</Label>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {config.resumeFileName || "Upload Resume"}
                </Button>
                {config.resume && (
                  <Button type="button" variant="ghost" size="icon" onClick={clearResume}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <Textarea
                placeholder="Or paste your resume content here... (skills, projects, experience, education)"
                className="min-h-[120px]"
                value={config.resume}
                onChange={(e) => setConfig({ ...config, resume: e.target.value })}
              />
              
              {config.resume && config.resume.length > 50 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={analyzeResume}
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Analyze Resume (ATS Score)
                    </>
                  )}
                </Button>
              )}

              {/* ATS Result Preview */}
              {atsResult && (
                <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">ATS Score</span>
                    <Badge variant={atsResult.atsScore >= 70 ? "success" : atsResult.atsScore >= 50 ? "warning" : "destructive"}>
                      {atsResult.atsScore}/100
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Role Compatibility</span>
                    <span className="text-sm font-medium">{atsResult.roleCompatibilityScore}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{atsResult.summary}</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                This helps the AI personalize questions based on your background
              </p>
            </div>

            <Button 
              type="submit" 
              variant="hero" 
              size="lg" 
              className="w-full"
              disabled={!isFormValid}
            >
              Start Interview
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
