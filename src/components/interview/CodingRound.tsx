import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  CheckCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Code,
  FileText,
  Lightbulb,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { InterviewConfig } from "./InterviewSetup";

export interface CodingQuestion {
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  starterCode: string;
  hints: string[];
}

export interface CodingResult {
  questions: CodingQuestion[];
  answers: { questionId: number; code: string; passed: boolean }[];
  score: number;
}

interface CodingRoundProps {
  config: InterviewConfig;
  onComplete: (result: CodingResult) => void;
  onEnd: () => void;
}

const DEFAULT_QUESTIONS: CodingQuestion[] = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
    starterCode: "function twoSum(nums, target) {\n  // Write your code here\n  \n}",
    hints: ["Try using a hash map to store values you've seen", "For each number, check if target - num exists in the map"],
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'"],
    starterCode: "function isValid(s) {\n  // Write your code here\n  \n}",
    hints: ["Use a stack data structure", "Push opening brackets, pop and match for closing brackets"],
  },
  {
    id: 3,
    title: "Reverse Linked List",
    difficulty: "Medium",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" },
    ],
    constraints: ["The number of nodes in the list is [0, 5000]", "-5000 <= Node.val <= 5000"],
    starterCode: "function reverseList(head) {\n  // ListNode structure: { val: number, next: ListNode | null }\n  // Write your code here\n  \n}",
    hints: ["Keep track of previous, current, and next pointers", "Iteratively reverse the links"],
  },
];

export function CodingRound({ config, onComplete, onEnd }: CodingRoundProps) {
  const [questions, setQuestions] = useState<CodingQuestion[]>(DEFAULT_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [codes, setCodes] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set());

  const currentQuestion = questions[currentIndex];

  // Initialize codes with starter code
  useEffect(() => {
    const initialCodes: Record<number, string> = {};
    questions.forEach(q => {
      initialCodes[q.id] = q.starterCode;
    });
    setCodes(initialCodes);
  }, [questions]);

  // Fetch AI-generated questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-coding-questions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              role: config.role,
              level: config.interviewLevel,
              field: config.interestField,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions);
          }
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        // Use default questions on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [config]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCodes(prev => ({ ...prev, [currentQuestion.id]: value }));
    }
  };

  const handleRunCode = () => {
    toast.info("Running code...");
    // Simulate code execution
    setTimeout(() => {
      toast.success("Code executed successfully!");
    }, 1000);
  };

  const handleSubmitQuestion = () => {
    setSubmittedQuestions(prev => new Set(prev).add(currentQuestion.id));
    toast.success(`Submitted: ${currentQuestion.title}`);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleFinish = () => {
    const answers = questions.map(q => ({
      questionId: q.id,
      code: codes[q.id] || q.starterCode,
      passed: submittedQuestions.has(q.id),
    }));

    const score = Math.round((submittedQuestions.size / questions.length) * 100);

    onComplete({
      questions,
      answers,
      score,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "success";
      case "Medium": return "warning";
      case "Hard": return "destructive";
      default: return "secondary";
    }
  };

  if (isLoading || !currentQuestion) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <h2 className="text-xl font-semibold">Generating Coding Questions...</h2>
          <p className="text-muted-foreground">Preparing {config.interviewLevel} level problems for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-background">
      {/* Header Bar */}
      <div className="fixed top-16 left-0 right-0 h-12 bg-card border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1">
            <Code className="w-3 h-3" />
            Coding Round
          </Badge>
          <div className="flex items-center gap-2">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                  i === currentIndex 
                    ? "bg-primary text-primary-foreground" 
                    : submittedQuestions.has(q.id)
                    ? "bg-success text-success-foreground"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                {submittedQuestions.has(q.id) ? <CheckCircle className="w-4 h-4 mx-auto" /> : i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(elapsedTime)}
          </Badge>
          <Button variant="destructive" size="sm" onClick={onEnd}>
            End Interview
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-12 h-[calc(100vh-4rem)] flex">
        {/* Problem Panel */}
        <div className="w-1/2 border-r border-border overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Problem Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-display">
                  {currentIndex + 1}. {currentQuestion.title}
                </h1>
                <Badge variant={getDifficultyColor(currentQuestion.difficulty) as any}>
                  {currentQuestion.difficulty}
                </Badge>
              </div>
            </div>

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="description" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Description
                </TabsTrigger>
                <TabsTrigger value="hints" className="flex-1">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Hints
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-4 space-y-6">
                {/* Description */}
                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground whitespace-pre-wrap">{currentQuestion.description}</p>
                </div>

                {/* Examples */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Examples:</h3>
                  {currentQuestion.examples.map((example, i) => (
                    <Card key={i} variant="glass" className="p-4">
                      <div className="space-y-2 font-mono text-sm">
                        <p><span className="text-muted-foreground">Input:</span> {example.input}</p>
                        <p><span className="text-muted-foreground">Output:</span> {example.output}</p>
                        {example.explanation && (
                          <p className="text-muted-foreground text-xs">{example.explanation}</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Constraints:</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {currentQuestion.constraints.map((c, i) => (
                      <li key={i} className="font-mono">{c}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="hints" className="mt-4 space-y-4">
                {currentQuestion.hints.map((hint, i) => (
                  <Card key={i} variant="glass" className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                      </div>
                      <p className="text-sm">{hint}</p>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="w-1/2 flex flex-col">
          {/* Editor Header */}
          <div className="h-12 bg-card/50 border-b border-border flex items-center justify-between px-4">
            <Badge variant="outline">JavaScript</Badge>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRunCode}>
                <Play className="w-4 h-4 mr-1" />
                Run
              </Button>
              <Button 
                variant="hero" 
                size="sm" 
                onClick={handleSubmitQuestion}
                disabled={submittedQuestions.has(currentQuestion.id)}
              >
                {submittedQuestions.has(currentQuestion.id) ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Submitted
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              language="javascript"
              theme="vs-dark"
              value={codes[currentQuestion.id] || currentQuestion.starterCode}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
              }}
            />
          </div>

          {/* Navigation */}
          <div className="h-14 bg-card/50 border-t border-border flex items-center justify-between px-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} of {questions.length}
            </span>

            {currentIndex < questions.length - 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex(prev => prev + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button variant="hero" size="sm" onClick={handleFinish}>
                Finish Coding Round
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
