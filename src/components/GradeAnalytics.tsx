import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Target, Brain } from "lucide-react";

const gpaData = [
  { semester: "Fall 2023", gpa: 3.2 },
  { semester: "Spring 2024", gpa: 3.4 },
  { semester: "Fall 2024", gpa: 3.45 },
  { semester: "Spring 2025", gpa: 3.7, predicted: true }
];

const courseAnalysis = [
  { course: "Mathematics", difficulty: 8.5, performance: 85 },
  { course: "Physics", difficulty: 9.2, performance: 78 },
  { course: "Chemistry", difficulty: 7.8, performance: 92 },
  { course: "English", difficulty: 6.5, performance: 88 },
  { course: "Computer Science", difficulty: 8.0, performance: 90 }
];

const gradeDistribution = [
  { grade: "A", count: 12, color: "hsl(var(--primary))" },
  { grade: "B", count: 8, color: "hsl(var(--accent))" },
  { grade: "C", count: 3, color: "hsl(var(--secondary))" },
  { grade: "D", count: 1, color: "hsl(var(--muted))" }
];

const chartConfig = {
  gpa: {
    label: "GPA",
    color: "hsl(var(--primary))"
  },
  difficulty: {
    label: "Difficulty",
    color: "hsl(var(--destructive))"
  },
  performance: {
    label: "Performance",
    color: "hsl(var(--primary))"
  }
};

export const GradeAnalytics = () => {
  const currentGPA = 3.45;
  const targetGPA = 3.70;
  const trendDirection = gpaData[gpaData.length - 2]?.gpa < currentGPA ? "up" : "down";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPA Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {trendDirection === "up" ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              GPA Trend Analysis
            </CardTitle>
            <CardDescription>
              Your academic performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart data={gpaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semester" />
                <YAxis domain={[3.0, 4.0]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="gpa" 
                  stroke="var(--color-gpa)" 
                  strokeWidth={3}
                  dot={{ fill: "var(--color-gpa)", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ChartContainer>
            <div className="mt-4 p-3 bg-primary/5 rounded-lg">
              <p className="text-sm font-medium">Prediction for Next Semester</p>
              <p className="text-xs text-muted-foreground">
                Based on current trends, you're on track to achieve your target GPA of {targetGPA}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Course Difficulty vs Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Course Analysis
            </CardTitle>
            <CardDescription>
              Difficulty rating vs your performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={courseAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="difficulty" fill="var(--color-difficulty)" name="Difficulty (1-10)" />
                <Bar dataKey="performance" fill="var(--color-performance)" name="Performance %" />
              </BarChart>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Strengths</p>
                <p className="text-muted-foreground">Chemistry, Computer Science</p>
              </div>
              <div>
                <p className="font-medium">Focus Areas</p>
                <p className="text-muted-foreground">Physics, Mathematics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>
              Your grade breakdown across all courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ grade, count }) => `${grade}: ${count}`}
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Insights
            </CardTitle>
            <CardDescription>
              AI-powered recommendations for improvement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
              <p className="font-medium text-green-800 dark:text-green-200">Strong Performance</p>
              <p className="text-sm text-green-600 dark:text-green-300">
                Your Chemistry grades show consistent excellence. Consider tutoring others to reinforce learning.
              </p>
            </div>
            
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950 dark:border-amber-800">
              <p className="font-medium text-amber-800 dark:text-amber-200">Improvement Opportunity</p>
              <p className="text-sm text-amber-600 dark:text-amber-300">
                Physics performance could improve with more problem-solving practice. Schedule 2 extra hours weekly.
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
              <p className="font-medium text-blue-800 dark:text-blue-200">Study Pattern</p>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Your best performance comes after 3+ consecutive study days. Maintain consistency for optimal results.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};