import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  BookOpen, 
  Youtube, 
  Code, 
  GraduationCap,
  FileText,
  Globe,
  Sparkles
} from "lucide-react";

interface FreeResource {
  name: string;
  type: string;
  url: string;
  description: string;
}

interface FreeResourcesSectionProps {
  resources?: FreeResource[];
}

const defaultResources = [
  {
    name: "freeCodeCamp",
    type: "platform",
    url: "https://www.freecodecamp.org",
    description: "Free coding bootcamp with certifications",
    icon: Code,
    color: "from-green-500 to-emerald-500"
  },
  {
    name: "Khan Academy",
    type: "platform",
    url: "https://www.khanacademy.org",
    description: "Free courses on math, science & computing",
    icon: GraduationCap,
    color: "from-blue-500 to-cyan-500"
  },
  {
    name: "Coursera",
    type: "platform",
    url: "https://www.coursera.org",
    description: "Audit top university courses for free",
    icon: BookOpen,
    color: "from-purple-500 to-pink-500"
  },
  {
    name: "YouTube",
    type: "video",
    url: "https://www.youtube.com",
    description: "Endless free tutorials and lectures",
    icon: Youtube,
    color: "from-red-500 to-rose-500"
  },
  {
    name: "MDN Web Docs",
    type: "documentation",
    url: "https://developer.mozilla.org",
    description: "Comprehensive web development docs",
    icon: FileText,
    color: "from-orange-500 to-yellow-500"
  },
  {
    name: "GeeksforGeeks",
    type: "platform",
    url: "https://www.geeksforgeeks.org",
    description: "DSA and programming tutorials",
    icon: Globe,
    color: "from-teal-500 to-cyan-500"
  }
];

export function FreeResourcesSection({ resources }: FreeResourcesSectionProps) {
  const displayResources = resources && resources.length > 0 
    ? resources.map((r, i) => ({
        ...r,
        icon: defaultResources[i % defaultResources.length].icon,
        color: defaultResources[i % defaultResources.length].color
      }))
    : defaultResources;

  return (
    <Card className="glass-strong border-border/50 mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          Free Learning Resources
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Curated collection of completely free platforms to accelerate your learning journey
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayResources.map((resource, index) => {
            const Icon = resource.icon || Globe;
            return (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="h-full border-border/30 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 bg-muted/30 hover:bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${resource.color || 'from-primary to-accent'} flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {resource.name}
                          </h4>
                          <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        </div>
                        <Badge variant="outline" className="text-[10px] mb-2 capitalize">
                          {resource.type}
                        </Badge>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {resource.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Pro Tip</h4>
              <p className="text-sm text-muted-foreground">
                Most paid courses on Coursera and edX can be audited for free. Look for "Audit" or "Free" options!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}