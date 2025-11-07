/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
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
import { GradeAnalytics } from "./GradeAnalytics";
import { analyticsAPI, targetGradesAPI, eventsAPI } from "@/services/api";
import { DashboardData } from "@/types";


export const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    currentGpa: 0,
    targetGpa: 0,
    totalCredits: 0,
    upcomingEvents: 0,
    isLoading: true
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load analytics data
        const analytics = await analyticsAPI.getCumulativeGpa();
        
        // Load target grade
        let targetGpa = 0;
        try {
          const target = await targetGradesAPI.getTargetGrade();
          targetGpa = target?.targetGpa || 0;
        } catch (error) {
          // No target grade set
        }
        
        // Load upcoming events (next 7 days)
        const events = await eventsAPI.getEvents();
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcomingEvents = (events || []).filter((event: any) => {
          const eventDate = new Date(event.date);
          return eventDate >= today && eventDate <= nextWeek;
        }).length;
        
        setDashboardData({
          currentGpa: analytics.cumulativeGpa,
          targetGpa: targetGpa,
          totalCredits: analytics.totalCredits,
          upcomingEvents: upcomingEvents,
          isLoading: false
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        
        // Fallback to localStorage
        const semesterData = localStorage.getItem('semesterData');
        const targetData = localStorage.getItem('targetGrade');
        
        let currentGpa = 0;
        let totalCredits = 0;
        
        if (semesterData) {
          const semesters = JSON.parse(semesterData);
          const allCourses = semesters.flatMap((s: any) => s.courses);
          
          if (allCourses.length > 0) {
            const totalPoints = allCourses.reduce((sum: number, course: any) => sum + (course.points * course.credits), 0);
            totalCredits = allCourses.reduce((sum: number, course: any) => sum + course.credits, 0);
            currentGpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
          }
        }
        
        const targetGpa = targetData ? JSON.parse(targetData).targetGPA : 0;
        
        setDashboardData({
          currentGpa: currentGpa,
          targetGpa: targetGpa,
          totalCredits: totalCredits,
          upcomingEvents: 0,
          isLoading: false
        });
      }
    };
    
    loadDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-accent-light/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative px-4 sm:px-6 py-8 sm:py-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Welcome to Royal Planner
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Take charge of your academic journey with powerful tools designed for student success
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 sm:px-6 -mt-4 sm:-mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4" />
                Current GPA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.isLoading ? "..." : dashboardData.currentGpa.toFixed(2)}
              </div>
              <p className="text-xs opacity-90">
                {dashboardData.totalCredits} total credits
              </p>
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
              <div className="text-2xl font-bold">
                {dashboardData.isLoading ? "..." : dashboardData.targetGpa.toFixed(2)}
              </div>
              <p className="text-xs opacity-80">
                {dashboardData.targetGpa > 0 ? "Keep pushing forward!" : "Set your target"}
              </p>
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
              <div className="text-2xl font-bold text-primary">
                {dashboardData.isLoading ? "..." : dashboardData.upcomingEvents}
              </div>
              <p className="text-xs text-muted-foreground">events coming up</p>
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
      <div className="px-4 sm:px-6 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
      <div className="px-4 sm:px-6 mb-6 sm:mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progress Toward Goals
            </CardTitle>
            <CardDescription>
              {dashboardData.targetGpa > 0 ? 
                `You're ${dashboardData.currentGpa >= dashboardData.targetGpa ? 'exceeding' : 'working toward'} your target!` :
                'Set your target GPA to track your progress.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {dashboardData.targetGpa > 0 ? (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Target GPA: {dashboardData.targetGpa.toFixed(2)}</span>
                  <span>Current: {dashboardData.currentGpa.toFixed(2)}</span>
                </div>
                <Progress 
                  value={Math.min((dashboardData.currentGpa / dashboardData.targetGpa) * 100, 100)} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboardData.currentGpa >= dashboardData.targetGpa ? 
                    `🎉 Congratulations! You've achieved your target GPA!` :
                    `You need ${(dashboardData.targetGpa - dashboardData.currentGpa).toFixed(2)} more points to reach your target`
                  }
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">No target GPA set</p>
                <Link to="/target">
                  <Button>
                    <Target className="h-4 w-4 mr-2" />
                    Set Your Target GPA
                  </Button>
                </Link>
              </div>
            )}
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Total Credits: {dashboardData.totalCredits}</span>
                <span>Courses Completed: {dashboardData.totalCredits > 0 ? Math.floor(dashboardData.totalCredits / 3) : 0}</span>
              </div>
              <Progress 
                value={dashboardData.totalCredits > 0 ? Math.min((dashboardData.totalCredits / 120) * 100, 100) : 0} 
                className="h-2" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardData.totalCredits > 0 ? 
                  `${120 - dashboardData.totalCredits} credits remaining for graduation (assuming 120 total)` :
                  'Add courses to track your progress toward graduation'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade Analytics Dashboard */}
      <div className="px-4 sm:px-6 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Grade Analytics Dashboard</h2>
        <GradeAnalytics />
      </div>

      {/* Recent Journal Entry */}
      <div className="px-4 sm:px-6 pb-6 sm:pb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Latest Reflection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">No journal entries yet</p>
              <Link to="/journal">
                <Button>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Your First Entry
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};