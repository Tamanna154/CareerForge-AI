import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Send, 
  Clock, 
  User,
  Bot,
  Loader2,
  Volume2,
  VolumeX
} from "lucide-react";
import { InterviewConfig, ATSResult } from "./InterviewSetup";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "interviewer" | "candidate";
  content: string;
  timestamp: Date;
}

interface InterviewSessionProps {
  config: InterviewConfig;
  atsResult?: ATSResult;
  onComplete: (report: InterviewReport) => void;
  onEnd: () => void;
}

export interface InterviewReport {
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  confidenceScore: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  atsResult?: ATSResult;
  answers: { question: string; answer: string }[];
}

export function InterviewSession({ config, atsResult, onComplete, onEnd }: InterviewSessionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [isAITyping, setIsAITyping] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pendingTranscriptRef = useRef("");

  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech({ rate: 0.95 });

  // Handle speech result - collect transcript and auto-send when done
  const handleSpeechResult = useCallback((transcript: string) => {
    console.log("Speech result received:", transcript);
    pendingTranscriptRef.current += " " + transcript;
    setCurrentInput(pendingTranscriptRef.current.trim());
  }, []);

  const handleSpeechEnd = useCallback(() => {
    console.log("Speech ended, transcript:", pendingTranscriptRef.current);
    if (pendingTranscriptRef.current.trim()) {
      // Auto-send the message when speech ends
      const finalTranscript = pendingTranscriptRef.current.trim();
      pendingTranscriptRef.current = "";
      setCurrentInput("");
      setIsRecording(false);
      
      // Send the message
      sendMessage(finalTranscript);
    }
  }, []);

  const { isListening, isSupported: isSpeechSupported, startListening, stopListening } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onEnd: handleSpeechEnd,
    onError: (error) => {
      if (error !== 'aborted' && error !== 'no-speech') {
        toast.error("Speech recognition error: " + error);
      }
      setIsRecording(false);
    },
    continuous: true,
  });

  // Start video
  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
        toast.error("Could not access camera/microphone");
      }
    };
    startVideo();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      stopSpeaking();
    };
  }, []);

  // Initial AI greeting
  useEffect(() => {
    const initChat = async () => {
      await sendToAI([]);
    };
    initChat();
  }, []);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendToAI = async (chatHistory: { role: string; content: string }[]) => {
    setIsAITyping(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: chatHistory,
            config,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI response");
      }

      const data = await response.json();
      const aiText = data.response;

      // Add AI message
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "interviewer",
        content: aiText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setQuestionCount(prev => prev + 1);

      // Speak the response if TTS is enabled
      if (isTTSEnabled && aiText) {
        speak(aiText).catch(console.error);
      }

      // Check if interview is complete
      if (aiText.toLowerCase().includes("interview is now complete") || questionCount >= 6) {
        setTimeout(() => {
          generateReport();
        }, 3000);
      }

    } catch (error) {
      console.error("AI chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get AI response");
    } finally {
      setIsAITyping(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isAITyping) return;

    // Add candidate message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "candidate",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Build chat history
    const chatHistory = [...messages, userMessage].map(m => ({
      role: m.role === "interviewer" ? "assistant" : "user",
      content: m.content,
    }));

    await sendToAI(chatHistory);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isAITyping) return;

    // Stop listening if active
    if (isListening) {
      stopListening();
    }
    
    pendingTranscriptRef.current = "";
    const text = currentInput.trim();
    setCurrentInput("");
    await sendMessage(text);
  };

  const generateReport = () => {
    // Extract Q&A pairs
    const answers: { question: string; answer: string }[] = [];
    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].role === "interviewer" && messages[i + 1]?.role === "candidate") {
        answers.push({
          question: messages[i].content,
          answer: messages[i + 1].content,
        });
      }
    }

    // Calculate scores based on answer length and keyword analysis
    const avgAnswerLength = answers.reduce((sum, a) => sum + a.answer.length, 0) / Math.max(answers.length, 1);
    const technicalKeywords = ["implemented", "developed", "built", "designed", "algorithm", "system", "database", "api", "framework"];
    const communicationScore = Math.min(95, 65 + (avgAnswerLength / 10));
    
    let technicalScore = 70;
    answers.forEach(a => {
      technicalKeywords.forEach(kw => {
        if (a.answer.toLowerCase().includes(kw)) technicalScore += 2;
      });
    });
    technicalScore = Math.min(95, technicalScore);

    const report: InterviewReport = {
      technicalScore: Math.round(technicalScore),
      communicationScore: Math.round(communicationScore),
      problemSolvingScore: Math.floor(Math.random() * 15) + 75,
      confidenceScore: Math.floor(Math.random() * 15) + 72,
      overallScore: Math.round((technicalScore + communicationScore + 75) / 3),
      strengths: [
        "Clear communication style",
        "Good understanding of fundamentals",
        "Positive attitude and enthusiasm",
      ],
      weaknesses: [
        "Could provide more specific examples",
        "Consider elaborating on technical details",
      ],
      suggestions: [
        "Practice behavioral questions using STAR method",
        "Prepare more project-specific talking points",
        "Research company background before interviews",
      ],
      atsResult,
      answers,
    };
    onComplete(report);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMic = () => {
    if (isRecording || isListening) {
      stopListening();
      setIsRecording(false);
      // Process any pending transcript
      if (pendingTranscriptRef.current.trim()) {
        const finalTranscript = pendingTranscriptRef.current.trim();
        pendingTranscriptRef.current = "";
        setCurrentInput("");
        sendMessage(finalTranscript);
      }
    } else if (isSpeechSupported) {
      if (isSpeaking) {
        stopSpeaking();
      }
      pendingTranscriptRef.current = "";
      setCurrentInput("");
      setIsRecording(true);
      startListening();
      toast.info("Listening... Speak your answer, then click mic again to send");
    } else {
      toast.error("Speech recognition not supported in your browser");
    }
  };

  return (
    <div className="min-h-screen pt-20 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Candidate Video */}
            <Card variant="elevated" className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover ${!isVideoOn ? 'hidden' : ''}`}
                />
                {!isVideoOn && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <User className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                  <Badge variant="glass">{config.name}</Badge>
                  <div className="flex gap-2">
                    <Badge variant={isRecording ? "success" : "secondary"}>
                      {isRecording ? <Mic className="w-3 h-3 animate-pulse" /> : <MicOff className="w-3 h-3" />}
                    </Badge>
                    <Badge variant={isVideoOn ? "success" : "secondary"}>
                      {isVideoOn ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3" />}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Controls */}
            <div className="flex gap-2">
              <Button 
                variant={isVideoOn ? "default" : "destructive"}
                className="flex-1"
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
              <Button 
                variant={isAudioOn ? "default" : "destructive"}
                className="flex-1"
                onClick={() => setIsAudioOn(!isAudioOn)}
              >
                {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              <Button 
                variant={isTTSEnabled ? "default" : "secondary"}
                className="flex-1"
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setIsTTSEnabled(!isTTSEnabled);
                }}
              >
                {isTTSEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button 
                variant="destructive"
                className="flex-1"
                onClick={onEnd}
              >
                End Interview
              </Button>
            </div>

            {/* Interview Info */}
            <Card variant="glass" className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(elapsedTime)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Questions</span>
                <Badge variant="info">{questionCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <Badge variant="glass">{config.interviewType}</Badge>
              </div>
              {isSpeaking && (
                <div className="flex items-center gap-2 text-primary">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span className="text-xs">AI Speaking...</span>
                </div>
              )}
              {isRecording && (
                <div className="flex items-center gap-2 text-destructive">
                  <Mic className="w-4 h-4 animate-pulse" />
                  <span className="text-xs">Recording your answer...</span>
                </div>
              )}
            </Card>
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-2">
            <Card variant="elevated" className="h-[calc(100vh-8rem)] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Interviewer</h3>
                  <p className="text-xs text-muted-foreground">
                    {isAITyping ? "Typing..." : isSpeaking ? "Speaking..." : "Online"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.role === "candidate" ? "justify-end" : "justify-start"}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "candidate" 
                          ? "bg-primary text-primary-foreground rounded-br-md" 
                          : "glass rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.role === "candidate" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isAITyping && (
                  <div className="flex justify-start">
                    <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-3">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    className="h-[60px] w-[60px] flex-shrink-0"
                    onClick={toggleMic}
                    disabled={isAITyping}
                  >
                    {isRecording ? (
                      <Mic className="w-6 h-6 animate-pulse" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </Button>
                  <Textarea
                    placeholder={isRecording ? "Listening... Click mic to send" : "Type or click mic to speak..."}
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[60px] max-h-[120px]"
                    disabled={isRecording}
                  />
                  <Button 
                    variant="hero" 
                    size="icon" 
                    className="h-[60px] w-[60px] flex-shrink-0"
                    onClick={handleSendMessage}
                    disabled={!currentInput.trim() || isAITyping || isRecording}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
                {isRecording && (
                  <p className="text-xs text-center text-destructive mt-2 animate-pulse">
                    🎤 Recording... Click mic again to stop and send your answer
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
