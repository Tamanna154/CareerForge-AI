import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { MediaPermissions } from "@/components/interview/MediaPermissions";
import { InterviewSetup, InterviewConfig, ATSResult } from "@/components/interview/InterviewSetup";
import { InterviewSession, InterviewReport } from "@/components/interview/InterviewSession";
import { InterviewReportView } from "@/components/interview/InterviewReport";
import { CodingRound, CodingResult } from "@/components/interview/CodingRound";

type InterviewStep = "permissions" | "setup" | "session" | "coding" | "report";

export default function Interview() {
  const [step, setStep] = useState<InterviewStep>("permissions");
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [atsResult, setAtsResult] = useState<ATSResult | undefined>(undefined);
  const [report, setReport] = useState<InterviewReport | null>(null);

  const handlePermissionsGranted = () => {
    setStep("setup");
  };

  const handleSetupComplete = (interviewConfig: InterviewConfig, ats?: ATSResult) => {
    setConfig(interviewConfig);
    setAtsResult(ats);
    
    // If coding round, go to coding component
    if (interviewConfig.interviewType === "coding") {
      setStep("coding");
    } else {
      setStep("session");
    }
  };

  const handleInterviewComplete = (interviewReport: InterviewReport) => {
    setReport(interviewReport);
    setStep("report");
    
    // Save to history
    saveToHistory(interviewReport);
  };

  const handleCodingComplete = (codingResult: CodingResult) => {
    // Convert coding result to interview report format
    const report: InterviewReport = {
      technicalScore: codingResult.score,
      communicationScore: 0,
      problemSolvingScore: codingResult.score,
      confidenceScore: Math.round(codingResult.score * 0.9),
      overallScore: codingResult.score,
      strengths: codingResult.score >= 70 
        ? ["Good problem-solving skills", "Clean code structure", "Completed multiple challenges"]
        : ["Attempted the coding challenges", "Made progress on problems"],
      weaknesses: codingResult.score < 100 
        ? ["Could complete more challenges", "Consider optimizing solutions"]
        : [],
      suggestions: [
        "Practice more LeetCode-style problems",
        "Focus on time complexity analysis",
        "Review data structures and algorithms",
      ],
      atsResult,
      answers: codingResult.answers.map((a) => ({
        question: codingResult.questions.find(q => q.id === a.questionId)?.title || "",
        answer: a.code,
      })),
    };
    
    setReport(report);
    setStep("report");
    saveToHistory(report);
  };

  const handleEndInterview = () => {
    // Generate a partial report when ending early
    const partialReport: InterviewReport = {
      technicalScore: 50,
      communicationScore: 50,
      problemSolvingScore: 50,
      confidenceScore: 50,
      overallScore: 50,
      strengths: ["Started the interview process"],
      weaknesses: ["Interview ended early"],
      suggestions: [
        "Complete the full interview for accurate assessment",
        "Practice with more mock interviews",
      ],
      atsResult,
      answers: [],
    };
    
    setReport(partialReport);
    setStep("report");
    saveToHistory(partialReport);
  };

  const saveToHistory = (report: InterviewReport) => {
    if (!config) return;
    
    const historyEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: config.interviewType,
      role: config.role,
      overallScore: report.overallScore,
      technicalScore: report.technicalScore,
      communicationScore: report.communicationScore,
    };

    const existing = localStorage.getItem("interview_history");
    const history = existing ? JSON.parse(existing) : [];
    history.push(historyEntry);
    localStorage.setItem("interview_history", JSON.stringify(history));
  };

  const handleRestart = () => {
    setConfig(null);
    setAtsResult(undefined);
    setReport(null);
    setStep("setup");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {step === "permissions" && (
        <MediaPermissions onPermissionsGranted={handlePermissionsGranted} />
      )}
      
      {step === "setup" && (
        <InterviewSetup onSetupComplete={handleSetupComplete} />
      )}
      
      {step === "session" && config && (
        <InterviewSession 
          config={config} 
          atsResult={atsResult}
          onComplete={handleInterviewComplete}
          onEnd={handleEndInterview}
        />
      )}

      {step === "coding" && config && (
        <CodingRound
          config={config}
          onComplete={handleCodingComplete}
          onEnd={handleEndInterview}
        />
      )}
      
      {step === "report" && report && (
        <InterviewReportView report={report} onRestart={handleRestart} />
      )}
    </div>
  );
}
