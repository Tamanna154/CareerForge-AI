import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  "Unlimited mock interviews",
  "Real-time AI feedback",
  "ATS resume analysis",
  "Personalized improvement roadmap",
];

export function CTASection() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-primary opacity-10" />
          <div className="absolute inset-0 glass" />
          
          <div className="relative p-12 md:p-16 text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your
              <span className="text-gradient block mt-2">Interview Preparation?</span>
            </h2>
            
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Join thousands of students who have successfully prepared for their 
              dream jobs using our AI-powered platform.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle className="w-4 h-4 text-primary" />
                  {benefit}
                </div>
              ))}
            </div>

            <Link to="/interview">
              <Button variant="hero" size="xl">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
