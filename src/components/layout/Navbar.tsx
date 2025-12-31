import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  Video, 
  Calendar, 
  Briefcase, 
  LayoutDashboard,
  Map
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/interview", label: "Interview", icon: Video },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/opportunities", label: "Opportunities", icon: Briefcase },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center shadow-lg shadow-primary/30 transition-all group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/40 overflow-hidden border border-primary/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_50%)]" />
              <div className="relative flex items-center justify-center">
                <span className="text-2xl font-black text-primary-foreground tracking-tighter">IM</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-accent rounded-full flex items-center justify-center border-2 border-background shadow-md">
                <span className="text-[9px] font-black text-accent-foreground">AI</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-xl leading-tight tracking-tight text-foreground">
                Interview<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Mastery</span>
              </span>
              <span className="text-[11px] font-medium text-muted-foreground tracking-wide">AI-Powered Career Prep</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link key={link.href} to={link.href}>
                  <Button 
                    variant={isActive ? "secondary" : "ghost"} 
                    size="sm"
                    className={isActive ? "bg-secondary" : ""}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="hero" size="sm">
              Start Interview
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-strong border-t border-border animate-slide-up">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                >
                  <Button 
                    variant={isActive ? "secondary" : "ghost"} 
                    className="w-full justify-start"
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
            <Button variant="hero" className="w-full mt-4">
              Start Interview
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
