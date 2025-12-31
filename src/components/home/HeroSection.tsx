import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Video, Mic, Brain, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-glow opacity-60" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      {/* Floating Elements */}
      <div className="absolute top-32 left-[15%] animate-float">
        <div className="glass p-4 rounded-2xl shadow-glow">
          <Video className="w-6 h-6 text-primary" />
        </div>
      </div>
      <div className="absolute top-48 right-[20%] animate-float" style={{ animationDelay: "1s" }}>
        <div className="glass p-4 rounded-2xl shadow-glow">
          <Mic className="w-6 h-6 text-primary" />
        </div>
      </div>
      <div className="absolute bottom-32 left-[25%] animate-float" style={{ animationDelay: "2s" }}>
        <div className="glass p-4 rounded-2xl shadow-glow">
          <Brain className="w-6 h-6 text-primary" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-fade-in">
            <Badge variant="glass" className="mb-6 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              AI-Powered Interview Platform
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
            Master Your
            <span className="block text-gradient mt-2">Interview Skills</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Practice with our AI interviewer, get real-time feedback, analyze your resume with ATS scoring, 
            and discover internships, placements, and hackathons tailored to your profile.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link to="/interview">
              <Button variant="hero" size="xl">
                Start AI Interview
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/opportunities">
              <Button variant="glass" size="xl">
                Explore Opportunities
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {[
              { value: "10K+", label: "Students Prepared" },
              { value: "95%", label: "Success Rate" },
              { value: "500+", label: "Companies" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-gradient">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
