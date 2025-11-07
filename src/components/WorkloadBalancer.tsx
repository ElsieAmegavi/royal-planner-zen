import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Clock, TrendingUp } from "lucide-react";
import { format, addDays, startOfWeek, isAfter, isBefore } from "date-fns";
import { eventsAPI, analyticsAPI } from "@/services/api";
import { PlannerEvent, DeadlineClusteringData } from "@/types";

// Helper function to calculate workload from events
const calculateWorkloadFromEvents = (events: PlannerEvent[]) => {
  const today = new Date();
  const weeksData = [];
  
  // Process events for workload analysis
  
  // Find the date range of all events
  const eventDates = events.map(event => new Date(event.date));
  const minDate = eventDates.length > 0 ? new Date(Math.min(...eventDates.map(d => d.getTime()))) : today;
  const maxDate = eventDates.length > 0 ? new Date(Math.max(...eventDates.map(d => d.getTime()))) : addDays(today, 56);
  
  // Start from the earliest event date or today, whichever is earlier
  const startDate = minDate < today ? minDate : today;
  const endDate = maxDate > addDays(today, 56) ? maxDate : addDays(today, 56);
  
  // Calculate number of weeks to cover
  const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const weeksToShow = Math.min(Math.max(totalWeeks, 8), 16); // Show at least 8 weeks, max 16
  
  // Generate weeks data
  for (let i = 0; i < weeksToShow; i++) {
    const weekStart = addDays(startOfWeek(startDate), i * 7);
    const weekEnd = addDays(weekStart, 6);
    const weekLabel = format(weekStart, "MMM d");
    
    // Filter events for this week
    const weekEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return isAfter(eventDate, weekStart) && isBefore(eventDate, addDays(weekEnd, 1));
    });
    
    // Count different types of events
    const assignments = weekEvents.filter(e => e.type === 'assignment').length;
    const exams = weekEvents.filter(e => e.type === 'exam' || e.type === 'quiz').length;
    const projects = weekEvents.filter(e => e.type === 'deadline').length;
    const classes = weekEvents.filter(e => e.type === 'class').length;
    const study = weekEvents.filter(e => e.type === 'study').length;
    const other = weekEvents.filter(e => !['assignment', 'exam', 'quiz', 'deadline', 'class', 'study'].includes(e.type)).length;
    
    // Calculate total hours (include all event types)
    const totalHours = assignments * 3 + exams * 4 + projects * 6 + classes * 2 + study * 2 + other * 2;
    
    // Calculate workload intensity
    
    // Determine difficulty
    let difficulty = "low";
    if (totalHours > 20) difficulty = "critical";
    else if (totalHours > 15) difficulty = "high";
    else if (totalHours > 10) difficulty = "medium";
    
    weeksData.push({
      week: weekLabel,
      assignments,
      exams,
      projects,
      classes,
      study,
      other,
      totalEvents: weekEvents.length,
      totalHours,
      difficulty
    });
  }
  
  return weeksData;
};

// Helper function to analyze deadline clustering
const analyzeDeadlineClustering = (events: PlannerEvent[]) => {
  const today = new Date();
  const nextMonth = addDays(today, 30);
  
  // Filter upcoming deadlines
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return isAfter(eventDate, today) && isBefore(eventDate, nextMonth) && 
           (event.type === 'deadline' || event.type === 'assignment' || event.type === 'exam');
  });
  
  // Group by date
  const dateGroups = upcomingEvents.reduce((groups, event) => {
    const dateKey = format(new Date(event.date), "MMM d");
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {} as Record<string, PlannerEvent[]>);
  
  // Convert to clustering data
  const clustering = Object.entries(dateGroups)
    .map(([date, events]) => {
      let type = "low";
      if (events.length >= 4) type = "critical";
      else if (events.length >= 3) type = "high";
      else if (events.length >= 2) type = "medium";
      
      return {
        date,
        count: events.length,
        type,
        events: events.map(e => e.title)
      };
    })
    .filter(cluster => cluster.count > 1) // Only show clusters
    .sort((a, b) => b.count - a.count); // Sort by count descending
  
  return clustering;
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "low": return "hsl(var(--primary))";
    case "medium": return "hsl(var(--accent))";
    case "high": return "hsl(var(--secondary))";
    case "critical": return "hsl(var(--destructive))";
    default: return "hsl(var(--muted))";
  }
};

const chartConfig = {
  assignments: {
    label: "Assignments",
    color: "hsl(var(--primary))"
  },
  exams: {
    label: "Exams",
    color: "hsl(var(--destructive))"
  },
  projects: {
    label: "Projects",
    color: "hsl(var(--accent))"
  },
  classes: {
    label: "Classes",
    color: "hsl(var(--secondary))"
  },
  study: {
    label: "Study",
    color: "hsl(var(--muted))"
  },
  other: {
    label: "Other",
    color: "hsl(var(--border))"
  },
  totalHours: {
    label: "Total Hours",
    color: "hsl(var(--foreground))"
  }
};

export const WorkloadBalancer = () => {
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [deadlineClustering, setDeadlineClustering] = useState<DeadlineClusteringData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load events and deadline clustering data
        const [eventsData, clusteringData] = await Promise.all([
          eventsAPI.getEvents(),
          analyticsAPI.getDeadlineClustering()
        ]);
        
        setEvents(eventsData || []);
        setDeadlineClustering(clusteringData);
      } catch (error) {
        console.error('Failed to load workload data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate workload from real events
  const workloadData = calculateWorkloadFromEvents(events);
  const deadlineCluster = analyzeDeadlineClustering(events);
  
  const criticalWeeks = workloadData.filter(week => week.difficulty === "critical");
  const avgWorkload = workloadData.length > 0 ? 
    workloadData.reduce((sum, week) => sum + week.totalHours, 0) / workloadData.length : 0;
  
  // Find next deadline
  const today = new Date();
  const upcomingDeadlines = events
    .filter(event => {
      const eventDate = new Date(event.date);
      return isAfter(eventDate, today) && 
             (event.type === 'deadline' || event.type === 'assignment' || event.type === 'exam');
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const nextDeadline = upcomingDeadlines[0];
  const daysToNextDeadline = nextDeadline ? 
    Math.ceil((new Date(nextDeadline.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  // Find peak week
  const peakWeek = workloadData.reduce((peak, week) => 
    week.totalHours > peak.totalHours ? week : peak, workloadData[0] || { week: "N/A", totalHours: 0 });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded mb-1" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Weekly Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgWorkload.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">per week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Critical Weeks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalWeeks.length}</div>
            <p className="text-xs text-muted-foreground">need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Next Deadline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nextDeadline ? daysToNextDeadline : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {nextDeadline ? "days away" : "no deadlines"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Peak Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peakWeek.week}</div>
            <p className="text-xs text-muted-foreground">{peakWeek.totalHours} hours</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Workload Distribution</CardTitle>
            <CardDescription>
              Assignment, exam, and project workload over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workloadData.length > 0 && workloadData.some(week => week.totalEvents > 0) ? (
              <ChartContainer config={chartConfig}>
                <BarChart data={workloadData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="assignments" stackId="a" fill="var(--color-assignments)" />
                  <Bar dataKey="exams" stackId="a" fill="var(--color-exams)" />
                  <Bar dataKey="projects" stackId="a" fill="var(--color-projects)" />
                  <Bar dataKey="classes" stackId="a" fill="var(--color-classes)" />
                  <Bar dataKey="study" stackId="a" fill="var(--color-study)" />
                  <Bar dataKey="other" stackId="a" fill="var(--color-other)" />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No workload data available</p>
                  <p className="text-sm">Add events to see workload distribution</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time Investment Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Time Investment Trend</CardTitle>
            <CardDescription>
              Total study hours required per week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workloadData.length > 0 && workloadData.some(week => week.totalHours > 0) ? (
              <>
                <ChartContainer config={chartConfig}>
                  <LineChart data={workloadData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="totalHours" 
                      stroke="var(--color-totalHours)" 
                      strokeWidth={3}
                      dot={{ fill: "var(--color-totalHours)", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
                {peakWeek.totalHours > 15 && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950 dark:border-amber-800">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Study Recommendation</p>
                    <p className="text-xs text-amber-600 dark:text-amber-300">
                      Peak week ({peakWeek.week}) has {peakWeek.totalHours} hours. Consider starting early or redistributing workload.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No time investment data available</p>
                  <p className="text-sm">Add events to see time trends</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deadline Clustering Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Deadline Clustering Alert</CardTitle>
          <CardDescription>
            Days with high concentration of deadlines
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deadlineCluster.length > 0 ? (
            <>
              <div className="space-y-3">
                {deadlineCluster.map((cluster, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{cluster.date}</span>
                      </div>
                      <Badge 
                        variant={cluster.type === "critical" ? "destructive" : cluster.type === "high" ? "secondary" : "outline"}
                      >
                        {cluster.count} deadlines
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {cluster.type} priority
                    </Badge>
                  </div>
                ))}
              </div>
              
              {deadlineCluster.some(cluster => cluster.type === "critical" || cluster.type === "high") && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-200">Workload Warning</p>
                      <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                        {deadlineCluster.filter(c => c.type === "critical").length > 0 ? 
                          `Critical deadline clustering detected. Consider starting assignments early or requesting deadline extensions where possible.` :
                          `High concentration of deadlines detected. Plan your time carefully to avoid last-minute stress.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No deadline clustering detected</p>
              <p className="text-sm">Your deadlines are well distributed</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balancing Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Workload Balancing Tips</CardTitle>
          <CardDescription>
            AI-powered suggestions for better time management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
              <p className="font-medium text-blue-800 dark:text-blue-200">Early Start Strategy</p>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Begin Feb 17 assignments by Jan 30 to reduce peak workload by 40%
              </p>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
              <p className="font-medium text-green-800 dark:text-green-200">Study Group Opportunity</p>
              <p className="text-sm text-green-600 dark:text-green-300">
                Form study groups for overlapping exam topics to maximize efficiency
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg dark:bg-purple-950 dark:border-purple-800">
              <p className="font-medium text-purple-800 dark:text-purple-200">Break Optimization</p>
              <p className="text-sm text-purple-600 dark:text-purple-300">
                Schedule recovery week after Feb 17 with lighter study load
              </p>
            </div>
            
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-950 dark:border-orange-800">
              <p className="font-medium text-orange-800 dark:text-orange-200">Resource Planning</p>
              <p className="text-sm text-orange-600 dark:text-orange-300">
                Book library study rooms early for critical weeks to ensure availability
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};