import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  BookOpen, 
  Award,
  Clock,
  Plus
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-accent-light/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative px-6 py-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Welcome to Royal Planner
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Take charge of your academic journey with powerful tools designed for student success
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4" />
                Current GPA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.45</div>
              <p className="text-xs opacity-90">+0.12 from last semester</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent to-accent-muted text-accent-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Target GPA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.70</div>
              <p className="text-xs opacity-80">Keep pushing forward!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">5</div>
              <p className="text-xs text-muted-foreground">assignments due</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Study Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">12</div>
              <p className="text-xs text-muted-foreground">days in a row</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <TrendingUp className="h-6 w-6" />
                </div>
                Calculate GPA
              </CardTitle>
              <CardDescription>
                Add your current semester grades and track your academic progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/gpa">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Grades
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Target className="h-6 w-6" />
                </div>
                Set Goals
              </CardTitle>
              <CardDescription>
                Define your target GPA and see what grades you need to achieve it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/target">
                <Button variant="outline" className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Plan Goals
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Calendar className="h-6 w-6" />
                </div>
                Weekly Planner
              </CardTitle>
              <CardDescription>
                Organize your classes, assignments, and study sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/planner">
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Schedule
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Progress Toward Goals */}
      <div className="px-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progress Toward Goals
            </CardTitle>
            <CardDescription>
              You're making great progress! Keep up the excellent work.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Target GPA: 3.70</span>
                <span>Current: 3.45</span>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                You need an average of 3.85 in remaining courses
              </p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Study Goal: 25 hours/week</span>
                <span>This week: 18 hours</span>
              </div>
              <Progress value={72} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                7 more hours to reach your weekly goal
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Journal Entry */}
      <div className="px-6 pb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Latest Reflection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground italic mb-4">
              "Had a great study session today. Finally understanding calculus concepts that were confusing me before. 
              Feeling more confident about the upcoming midterm..."
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">3 days ago</span>
              <Link to="/journal">
                <Button variant="outline" size="sm">
                  Read More
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};