import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  GraduationCap, 
  Trophy, 
  Calendar, 
  MapPin, 
  ExternalLink,
  Search,
  Building,
  Clock
} from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  type: "internship" | "placement" | "hackathon";
  company: string;
  location: string;
  mode: "Online" | "Offline" | "Hybrid";
  startDate: string;
  endDate: string;
  deadline: string;
  skills: string[];
  eligibility: string;
  applyLink: string;
}

const opportunities: Opportunity[] = [
  {
    id: "1",
    title: "Software Engineering Intern",
    type: "internship",
    company: "Google",
    location: "Bangalore, India",
    mode: "Hybrid",
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    deadline: "2024-02-15",
    skills: ["Python", "Data Structures", "Algorithms"],
    eligibility: "3rd/4th Year CSE/IT, CGPA > 7.5",
    applyLink: "#"
  },
  {
    id: "2",
    title: "Full Stack Developer",
    type: "placement",
    company: "Microsoft",
    location: "Hyderabad, India",
    mode: "Offline",
    startDate: "2024-07-01",
    endDate: "Permanent",
    deadline: "2024-03-01",
    skills: ["React", "Node.js", "TypeScript", "Azure"],
    eligibility: "Final Year, All Branches, CGPA > 7.0",
    applyLink: "#"
  },
  {
    id: "3",
    title: "HackIndia 2024",
    type: "hackathon",
    company: "TechCrunch",
    location: "Delhi, India",
    mode: "Offline",
    startDate: "2024-04-15",
    endDate: "2024-04-17",
    deadline: "2024-04-01",
    skills: ["Any Tech Stack", "Problem Solving", "Teamwork"],
    eligibility: "Open for all college students",
    applyLink: "#"
  },
  {
    id: "4",
    title: "Data Science Intern",
    type: "internship",
    company: "Amazon",
    location: "Remote",
    mode: "Online",
    startDate: "2024-05-15",
    endDate: "2024-07-15",
    deadline: "2024-02-28",
    skills: ["Python", "Machine Learning", "SQL", "Statistics"],
    eligibility: "2nd/3rd Year, CSE/IT/Data Science",
    applyLink: "#"
  },
  {
    id: "5",
    title: "Product Manager",
    type: "placement",
    company: "Flipkart",
    location: "Bangalore, India",
    mode: "Hybrid",
    startDate: "2024-08-01",
    endDate: "Permanent",
    deadline: "2024-04-15",
    skills: ["Product Strategy", "Analytics", "Communication"],
    eligibility: "MBA/Final Year Engineering, CGPA > 8.0",
    applyLink: "#"
  },
  {
    id: "6",
    title: "Smart India Hackathon",
    type: "hackathon",
    company: "Government of India",
    location: "Multiple Cities",
    mode: "Hybrid",
    startDate: "2024-08-01",
    endDate: "2024-08-03",
    deadline: "2024-07-15",
    skills: ["Innovation", "Problem Solving", "Tech Skills"],
    eligibility: "All engineering students",
    applyLink: "#"
  },
];

const typeConfig = {
  internship: { icon: GraduationCap, color: "text-info", badge: "info" },
  placement: { icon: Briefcase, color: "text-success", badge: "success" },
  hackathon: { icon: Trophy, color: "text-warning", badge: "warning" },
};

export default function Opportunities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTab = activeTab === "all" || opp.type === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const formatDate = (dateString: string) => {
    if (dateString === "Permanent") return dateString;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Discover
              <span className="text-gradient block mt-2">Opportunities</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find internships, placements, and hackathons tailored to your skills and interests
            </p>
          </div>

          {/* Search & Filter */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by title, company, or skills..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="internship">Internships</TabsTrigger>
                <TabsTrigger value="placement">Placements</TabsTrigger>
                <TabsTrigger value="hackathon">Hackathons</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Opportunities Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opp) => {
              const config = typeConfig[opp.type];
              const Icon = config.icon;
              
              return (
                <Card key={opp.id} variant="interactive" className="group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant={config.badge as any} className="capitalize">
                        <Icon className="w-3 h-3 mr-1" />
                        {opp.type}
                      </Badge>
                      <Badge variant="outline">{opp.mode}</Badge>
                    </div>
                    <CardTitle className="mt-3 group-hover:text-primary transition-colors">
                      {opp.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {opp.company}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {opp.location}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(opp.startDate)} - {formatDate(opp.endDate)}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        Deadline: {formatDate(opp.deadline)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {opp.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {opp.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{opp.skills.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Eligibility:</span> {opp.eligibility}
                    </div>

                    <Button variant="default" className="w-full group-hover:shadow-glow transition-shadow">
                      Apply Now
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredOpportunities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No opportunities found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
