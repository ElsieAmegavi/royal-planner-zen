import { useState, useEffect } from "react";
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
  Bell,
  Wifi,
  WifiOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileMenu } from "@/components/ProfileMenu";
import { connectionAPI } from "@/services/api";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: Crown },
  { name: "GPA Calculator", path: "/gpa", icon: Calculator },
  { name: "Target Grades", path: "/target", icon: Target },
  { name: "Planner", path: "/planner", icon: Calendar },
  { name: "Journal", path: "/journal", icon: BookOpen },
  { name: "Notifications", path: "/notifications", icon: Bell },
  { name: "Settings", path: "/settings", icon: Settings },
];

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const location = useLocation();

  // Mock notification count
  const notificationCount = 3;

  // Check connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await connectionAPI.testConnection();
        setIsOnline(connected);
      } catch (error) {
        setIsOnline(false);
      }
    };

    // Check connection on mount and periodically
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-background/80 backdrop-blur-sm border-b border-border z-40 flex items-center justify-between px-4">
        {/* Mobile Menu Button */}
        <Button
          variant="outline"
          size="icon"
          className="md:hidden bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
        
        {/* Connection Status and Profile Menu */}
        <div className="ml-auto flex items-center gap-3">
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-xs font-medium hidden sm:inline">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-xs font-medium hidden sm:inline">Offline</span>
              </div>
            )}
          </div>
          
          <ProfileMenu />
        </div>
      </header>

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
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium relative",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-lg" 
                        : "text-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                    {item.name === "Notifications" && notificationCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {notificationCount}
                      </Badge>
                    )}
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