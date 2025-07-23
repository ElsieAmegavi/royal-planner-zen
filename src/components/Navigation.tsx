import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Calculator, 
  Target, 
  Calendar, 
  BookOpen, 
  Settings, 
  Menu, 
  X,
  Crown,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", path: "/", icon: Crown },
  { name: "GPA Calculator", path: "/gpa", icon: Calculator },
  { name: "Target Grades", path: "/target", icon: Target },
  { name: "Planner", path: "/planner", icon: Calendar },
  { name: "Journal", path: "/journal", icon: BookOpen },
  { name: "Notifications", path: "/notifications", icon: Bell },
  { name: "Settings", path: "/settings", icon: Settings },
];

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-background/80 backdrop-blur-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <nav className={cn(
        "fixed left-0 top-0 h-full w-64 bg-secondary/30 backdrop-blur-sm border-r border-border z-40 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Royal Planner</h1>
              <p className="text-sm text-muted-foreground">Academic Success</p>
            </div>
          </div>

          {/* Navigation Items */}
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-lg" 
                        : "text-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};