import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Clock, TrendingUp } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";

// Sample workload data for the next 8 weeks
const workloadData = [
  { week: "Jan 27", assignments: 3, exams: 0, projects: 1, totalHours: 12, difficulty: "medium" },
  { week: "Feb 3", assignments: 5, exams: 1, projects: 0, totalHours: 18, difficulty: "high" },
  { week: "Feb 10", assignments: 2, exams: 0, projects: 2, totalHours: 15, difficulty: "high" },
  { week: "Feb 17", assignments: 4, exams: 2, projects: 0, totalHours: 22, difficulty: "critical" },
  { week: "Feb 24", assignments: 1, exams: 0, projects: 1, totalHours: 8, difficulty: "low" },
  { week: "Mar 3", assignments: 3, exams: 1, projects: 1, totalHours: 16, difficulty: "medium" },
  { week: "Mar 10", assignments: 6, exams: 0, projects: 2, totalHours: 20, difficulty: "high" },
  { week: "Mar 17", assignments: 2, exams: 1, projects: 0, totalHours: 10, difficulty: "medium" }
];

const deadlineCluster = [
  { date: "Feb 17", count: 6, type: "critical" },
  { date: "Feb 18", count: 4, type: "high" },
  { date: "Feb 19", count: 2, type: "medium" },
  { date: "Mar 10", count: 5, type: "high" },
  { date: "Mar 11", count: 3, type: "medium" }
];

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
  totalHours: {
    label: "Total Hours",
    color: "hsl(var(--secondary))"
  }
};

export const WorkloadBalancer = () => {
  const criticalWeeks = workloadData.filter(week => week.difficulty === "critical");
  const avgWorkload = workloadData.reduce((sum, week) => sum + week.totalHours, 0) / workloadData.length;

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
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">days away</p>
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
            <div className="text-2xl font-bold">Feb 17</div>
            <p className="text-xs text-muted-foreground">22 hours</p>
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
            <ChartContainer config={chartConfig}>
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="assignments" stackId="a" fill="var(--color-assignments)" />
                <Bar dataKey="exams" stackId="a" fill="var(--color-exams)" />
                <Bar dataKey="projects" stackId="a" fill="var(--color-projects)" />
              </BarChart>
            </ChartContainer>
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
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Study Recommendation</p>
              <p className="text-xs text-muted-foreground">
                Start preparing 2 weeks early for Feb 17 peak. Consider redistributing some work.
              </p>
            </div>
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
          
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">Workload Warning</p>
                <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                  Feb 17-19 shows critical clustering. Consider starting assignments early or requesting deadline extensions where possible.
                </p>
              </div>
            </div>
          </div>
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