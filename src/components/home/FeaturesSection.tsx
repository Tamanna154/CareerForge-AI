import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Video, 
  Mic, 
  FileText, 
  Brain, 
  Calendar, 
  Briefcase,
  BarChart3,
  MessageSquare 
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Video Interview",
    description: "Real-time video interviews with AI-powered analysis of your body language and confidence."
  },
  {
    icon: Mic,
    title: "Voice Analysis",
    description: "Get feedback on your communication skills, clarity, and professional tone."
  },
  {
    icon: FileText,
    title: "ATS Resume Scoring",
    description: "Analyze your resume against job requirements with detailed improvement suggestions."
  },
  {
    icon: Brain,
    title: "AI Interviewer",
    description: "Practice with our intelligent AI that adapts questions based on your responses."
  },
  {
    icon: Calendar,
    title: "Slot Booking",
    description: "Schedule mock interviews at your convenience with our flexible booking system."
  },
  {
    icon: Briefcase,
    title: "Opportunities Hub",
    description: "Discover internships, placements, and hackathons matched to your profile."
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track your progress with detailed scores and improvement roadmaps."
  },
  {
    icon: MessageSquare,
    title: "Instant Feedback",
    description: "Receive actionable feedback immediately after each interview session."
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-glow opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to
            <span className="text-gradient block mt-2">Ace Your Interview</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our comprehensive platform provides all the tools and resources to prepare you 
            for success in your career journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                variant="feature"
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
