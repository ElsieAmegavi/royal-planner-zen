import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Target, Brain, AlertTriangle, Clock, BookOpen } from "lucide-react";
import { analyticsAPI, targetGradesAPI } from "@/services/api";
import { 
  GpaTrendEntry, 
  CourseAnalysisEntry, 
  GradeDistributionEntry, 
  DeadlineClusteringData, 
  WorkloadDistributionEntry 
} from "@/types";

const chartConfig = {
  gpa: {
    label: "GPA",
    color: "hsl(var(--primary))"
  },
  performance: {
    label: "Performance",
    color: "hsl(var(--primary))"
  },
  credits: {
    label: "Credits",
    color: "hsl(var(--accent))"
  }
};

const gradeColors = {
  'A+': '#16a34a', // Dark green for exceptional grades
  'A': '#22c55e',  // Green for excellent grades
  'A-': '#4ade80', // Light green for excellent minus grades
  'B+': '#2563eb', // Dark blue for good plus grades
  'B': '#3b82f6',  // Blue for good grades
  'B-': '#60a5fa', // Light blue for good minus grades
  'C+': '#d97706', // Dark amber for average plus grades
  'C': '#f59e0b',  // Amber for average grades
  'C-': '#fbbf24', // Light amber for average minus grades
  'D+': '#ea580c', // Dark orange for below average plus grades
  'D': '#f97316',  // Orange for below average grades
  'D-': '#fb923c', // Light orange for below average minus grades
  'F': '#ef4444'   // Red for failing grades
};

const gradeDescriptions = {
  'A+': 'Exceptional (97-100%)',
  'A': 'Excellent (93-96%)',
  'A-': 'Excellent (90-92%)',
  'B+': 'Good (87-89%)',
  'B': 'Good (83-86%)',
  'B-': 'Good (80-82%)',
  'C+': 'Average (77-79%)',
  'C': 'Average (73-76%)',
  'C-': 'Average (70-72%)',
  'D+': 'Below Average (67-69%)',
  'D': 'Below Average (63-66%)',
  'D-': 'Below Average (60-62%)',
  'F': 'Failing (Below 60%)'
};

export const GradeAnalytics = () => {
  const [gpaTrend, setGpaTrend] = useState<GpaTrendEntry[]>([]);
  const [courseAnalysis, setCourseAnalysis] = useState<CourseAnalysisEntry[]>([]);
  const [gradeDistribution, setGradeDistribution] = useState<GradeDistributionEntry[]>([]);
  const [deadlineClustering, setDeadlineClustering] = useState<DeadlineClusteringData | null>(null);
  const [workloadDistribution, setWorkloadDistribution] = useState<WorkloadDistributionEntry[]>([]);
  const [targetGPA, setTargetGPA] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        // Load all analytics data in parallel
        const [
          gpaTrendData,
          courseAnalysisData,
          gradeDistributionData,
          deadlineClusteringData,
          workloadDistributionData,
          targetData
        ] = await Promise.all([
          analyticsAPI.getGpaTrend(),
          analyticsAPI.getCourseAnalysis(),
          analyticsAPI.getGradeDistribution(),
          analyticsAPI.getDeadlineClustering(),
          analyticsAPI.getWorkloadDistribution(),
          targetGradesAPI.getTargetGrade().catch(() => null)
        ]);

        setGpaTrend(gpaTrendData || []);
        setCourseAnalysis(courseAnalysisData || []);
        
        // Use sample data if no real data exists (for testing)
        const sampleGradeData = [
          { grade: 'A+', count: 2 },
          { grade: 'A', count: 5 },
          { grade: 'A-', count: 3 },
          { grade: 'B+', count: 4 },
          { grade: 'B', count: 6 },
          { grade: 'B-', count: 2 },
          { grade: 'C+', count: 3 },
          { grade: 'C', count: 4 },
          { grade: 'C-', count: 1 },
          { grade: 'D+', count: 1 },
          { grade: 'D', count: 2 },
          { grade: 'F', count: 1 }
        ];
        setGradeDistribution(gradeDistributionData && gradeDistributionData.length > 0 ? gradeDistributionData : sampleGradeData);
        
        setDeadlineClustering(deadlineClusteringData);
        setWorkloadDistribution(workloadDistributionData || []);
        setTargetGPA(targetData?.targetGpa || 0);
        
        // Data loaded successfully
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, []);

  const currentGPA = gpaTrend.length > 0 ? gpaTrend[gpaTrend.length - 1].gpa : 0;
  const trendDirection = gpaTrend.length > 1 ? 
    (gpaTrend[gpaTrend.length - 2].gpa < currentGPA ? "up" : "down") : "stable";

  // Generate performance insights based on real data
  const generatePerformanceInsights = () => {
    const insights = [];
    
    if (courseAnalysis.length > 0) {
      const bestCourse = courseAnalysis.reduce((best, current) => 
        current.performance > best.performance ? current : best
      );
      const worstCourse = courseAnalysis.reduce((worst, current) => 
        current.performance < worst.performance ? current : worst
      );

      if (bestCourse.performance >= 90) {
        insights.push({
          type: 'success',
          title: 'Strong Performance',
          message: `Your ${bestCourse.name} grades show consistent excellence. Consider tutoring others to reinforce learning.`
        });
      }

      if (worstCourse.performance < 80) {
        insights.push({
          type: 'warning',
          title: 'Improvement Opportunity',
          message: `${worstCourse.name} performance could improve with more focused study time. Consider scheduling extra practice sessions.`
        });
      }
    }

    if (gpaTrend.length > 1) {
      const recentTrend = gpaTrend.slice(-2);
      const improvement = recentTrend[1].gpa - recentTrend[0].gpa;
      
      if (improvement > 0.1) {
        insights.push({
          type: 'success',
          title: 'Positive Trend',
          message: `Your GPA has improved by ${improvement.toFixed(2)} points. Keep up the excellent work!`
        });
      } else if (improvement < -0.1) {
        insights.push({
          type: 'warning',
          title: 'Declining Performance',
          message: `Your GPA has decreased by ${Math.abs(improvement).toFixed(2)} points. Consider reviewing your study strategies.`
        });
      }
    }

    if (targetGPA > 0) {
      const gap = targetGPA - currentGPA;
      if (gap > 0.2) {
        insights.push({
          type: 'info',
          title: 'Target Gap',
          message: `You need to improve by ${gap.toFixed(2)} points to reach your target GPA of ${targetGPA}. Focus on your weaker subjects.`
        });
      } else if (gap <= 0.2 && gap > 0) {
        insights.push({
          type: 'success',
          title: 'Close to Target',
          message: `You're very close to your target GPA! Just ${gap.toFixed(2)} points to go.`
        });
      }
    }

    return insights;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
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

  const performanceInsights = generatePerformanceInsights();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPA Trend Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {trendDirection === "up" ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : trendDirection === "down" ? (
                <TrendingDown className="h-5 w-5 text-red-500" />
              ) : (
                <Target className="h-5 w-5 text-blue-500" />
              )}
              GPA Trend Analysis
            </CardTitle>
            <CardDescription>
              Your academic performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gpaTrend.length > 0 ? (
              <>
                <ChartContainer config={chartConfig}>
                  <LineChart data={gpaTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis domain={[0, 4.0]} />
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
                {targetGPA > 0 && (
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                    <p className="text-sm font-medium">Target Progress</p>
                    <p className="text-xs text-muted-foreground">
                      Current: {currentGPA.toFixed(2)} | Target: {targetGPA.toFixed(2)}
                      {currentGPA < targetGPA && (
                        <span className="text-amber-600"> | Gap: {(targetGPA - currentGPA).toFixed(2)}</span>
                      )}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No GPA data available</p>
                  <p className="text-sm">Add courses to see your GPA trend</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Course Analysis
            </CardTitle>
            <CardDescription>
              Performance across your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courseAnalysis.length > 0 ? (
              <>
                <ChartContainer config={chartConfig}>
                  <BarChart data={courseAnalysis.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="performance" fill="var(--color-performance)" name="Performance %" />
                  </BarChart>
                </ChartContainer>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Best Performance</p>
                    <p className="text-muted-foreground">
                      {courseAnalysis.length > 0 ? 
                        courseAnalysis.reduce((best, current) => 
                          current.performance > best.performance ? current : best
                        ).name : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Needs Attention</p>
                    <p className="text-muted-foreground">
                      {courseAnalysis.length > 0 ? 
                        courseAnalysis.reduce((worst, current) => 
                          current.performance < worst.performance ? current : worst
                        ).name : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No course data available</p>
                  <p className="text-sm">Add courses to see performance analysis</p>
                </div>
              </div>
            )}
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
            {gradeDistribution.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* Pie Chart */}
                <div className="flex-shrink-0 min-h-[280px] flex items-center justify-center bg-muted/20 rounded-lg p-4">
                  <div className="w-[280px] h-[280px]">
                    <PieChart width={280} height={280}>
                      <Pie
                        data={gradeDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={30}
                        dataKey="count"
                        label={({ grade, count }) => `${grade}: ${count}`}
                        labelLine={false}
                        fontSize={14}
                        fontWeight="bold"
                      >
                        {gradeDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={gradeColors[entry.grade as keyof typeof gradeColors] || '#94a3b8'} 
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                <p className="font-semibold text-foreground">
                                  Grade {data.grade}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {gradeDescriptions[data.grade as keyof typeof gradeDescriptions]}
                                </p>
                                <p className="text-sm font-medium text-foreground">
                                  {data.count} {data.count === 1 ? 'course' : 'courses'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {((data.count / gradeDistribution.reduce((sum, g) => sum + g.count, 0)) * 100).toFixed(1)}% of total
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </div>
                </div>

                {/* Compact Legend & Stats */}
                <div className="flex-1 space-y-4">
                  {/* Legend */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">Grade Breakdown</h4>
                    <div className="space-y-1">
                      {gradeDistribution.map((entry) => (
                        <div key={entry.grade} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: gradeColors[entry.grade as keyof typeof gradeColors] || '#94a3b8' }}
                            />
                            <span className="text-sm font-medium text-foreground">
                              Grade {entry.grade}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({gradeDescriptions[entry.grade as keyof typeof gradeDescriptions]})
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-foreground">
                              {entry.count}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({((entry.count / gradeDistribution.reduce((sum, g) => sum + g.count, 0)) * 100).toFixed(0)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="pt-3 border-t border-border">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-xl font-bold text-primary">
                          {gradeDistribution.reduce((sum, g) => sum + g.count, 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">Total Courses</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-green-600">
                          {gradeDistribution.filter(g => g.grade === 'A' || g.grade === 'B').reduce((sum, g) => sum + g.count, 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">A & B Grades</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No grades recorded</p>
                  <p className="text-sm">Add course grades to see distribution</p>
                </div>
              </div>
            )}
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
              Data-driven recommendations for improvement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceInsights.length > 0 ? (
              performanceInsights.map((insight, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  insight.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' :
                  insight.type === 'warning' ? 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800' :
                  'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
                }`}>
                  <p className={`font-medium ${
                    insight.type === 'success' ? 'text-green-800 dark:text-green-200' :
                    insight.type === 'warning' ? 'text-amber-800 dark:text-amber-200' :
                    'text-blue-800 dark:text-blue-200'
                  }`}>
                    {insight.title}
                  </p>
                  <p className={`text-sm ${
                    insight.type === 'success' ? 'text-green-600 dark:text-green-300' :
                    insight.type === 'warning' ? 'text-amber-600 dark:text-amber-300' :
                    'text-blue-600 dark:text-blue-300'
                  }`}>
                    {insight.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No insights available</p>
                <p className="text-sm">Add more data to get personalized recommendations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deadline Clustering Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Deadline Clustering Alert
            </CardTitle>
            <CardDescription>
              Monitor your upcoming deadlines and workload
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deadlineClustering ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${
                  deadlineClustering.clusteringAlert.alert 
                    ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                    : 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`h-5 w-5 ${
                      deadlineClustering.clusteringAlert.alert ? 'text-red-600' : 'text-green-600'
                    }`} />
                    <span className={`font-medium ${
                      deadlineClustering.clusteringAlert.alert ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'
                    }`}>
                      {deadlineClustering.clusteringAlert.alert ? 'High Alert' : 'All Good'}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    deadlineClustering.clusteringAlert.alert ? 'text-red-600 dark:text-red-300' : 'text-green-600 dark:text-green-300'
                  }`}>
                    {deadlineClustering.clusteringAlert.message}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">This Week</p>
                    <p className="text-2xl font-bold text-primary">{deadlineClustering.weeklyDeadlines}</p>
                    <p className="text-muted-foreground">deadlines</p>
                  </div>
                  <div>
                    <p className="font-medium">Next 30 Days</p>
                    <p className="text-2xl font-bold text-accent">{deadlineClustering.upcomingDeadlines}</p>
                    <p className="text-muted-foreground">deadlines</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No deadline data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Workload Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Weekly Workload Distribution
            </CardTitle>
            <CardDescription>
              Credit hours across semesters
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workloadDistribution.length > 0 ? (
              <>
                <ChartContainer config={chartConfig}>
                  <BarChart data={workloadDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="credits" fill="var(--color-credits)" name="Credits" />
                  </BarChart>
                </ChartContainer>
                <div className="mt-4 text-sm">
                  <p className="font-medium">Average Credits per Semester</p>
                  <p className="text-muted-foreground">
                    {workloadDistribution.length > 0 ? 
                      (workloadDistribution.reduce((sum, sem) => sum + sem.credits, 0) / workloadDistribution.length).toFixed(1)
                      : '0'
                    } credits
                  </p>
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No workload data available</p>
                  <p className="text-sm">Add semesters to see workload distribution</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};