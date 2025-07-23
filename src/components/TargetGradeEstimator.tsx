import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TargetData {
  targetGPA: number;
  targetSemester: string;
  currentCredits: number;
  currentGPA: number;
}

export const TargetGradeEstimator = () => {
  const [targetGPA, setTargetGPA] = useState("");
  const [targetSemester, setTargetSemester] = useState("");
  const [savedTarget, setSavedTarget] = useState<TargetData | null>(null);
  const [estimatedCreditsPerSemester, setEstimatedCreditsPerSemester] = useState("15");
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('targetGrade');
    if (saved) {
      setSavedTarget(JSON.parse(saved));
    }
  }, []);

  const getCurrentAcademicData = () => {
    const semesterData = localStorage.getItem('semesterData');
    const academicYears = localStorage.getItem('academicYears') || '4';
    
    let currentCredits = 0;
    let currentGPA = 0;
    let currentSemesterNumber = 1;
    
    if (semesterData) {
      const semesters = JSON.parse(semesterData);
      const allCourses = semesters.flatMap((s: any) => s.courses);
      
      if (allCourses.length > 0) {
        const totalPoints = allCourses.reduce((sum: number, course: any) => sum + (course.points * course.credits), 0);
        currentCredits = allCourses.reduce((sum: number, course: any) => sum + course.credits, 0);
        currentGPA = currentCredits > 0 ? totalPoints / currentCredits : 0;
      }
      
      // Find current semester
      const activeSemesters = semesters.filter((s: any) => s.courses.length > 0);
      if (activeSemesters.length > 0) {
        const lastSemester = activeSemesters[activeSemesters.length - 1];
        currentSemesterNumber = (lastSemester.year - 1) * 2 + lastSemester.semester;
      }
    }
    
    const totalSemesters = parseInt(academicYears) * 2;
    
    return { currentCredits, currentGPA, currentSemesterNumber, totalSemesters };
  };

  const generateSemesterOptions = () => {
    const { currentSemesterNumber, totalSemesters } = getCurrentAcademicData();
    const options = [];
    
    for (let i = currentSemesterNumber + 1; i <= totalSemesters; i++) {
      const year = Math.ceil(i / 2);
      const semester = i % 2 === 0 ? 2 : 1;
      options.push({
        value: `${year}-${semester}`,
        label: `Year ${year} - Semester ${semester}`
      });
    }
    
    return options;
  };

  const calculateRequiredGrades = () => {
    if (!savedTarget) return null;
    
    const { currentCredits, currentGPA, currentSemesterNumber } = getCurrentAcademicData();
    const targetSemesterParts = savedTarget.targetSemester.split('-');
    const targetSemesterNumber = (parseInt(targetSemesterParts[0]) - 1) * 2 + parseInt(targetSemesterParts[1]);
    
    const remainingSemesters = targetSemesterNumber - currentSemesterNumber;
    if (remainingSemesters <= 0) return null;
    
    const creditsPerSemester = parseInt(estimatedCreditsPerSemester);
    const futureCredits = remainingSemesters * creditsPerSemester;
    const totalFutureCredits = currentCredits + futureCredits;
    
    const currentTotalPoints = currentGPA * currentCredits;
    const requiredTotalPoints = savedTarget.targetGPA * totalFutureCredits;
    const requiredFuturePoints = requiredTotalPoints - currentTotalPoints;
    
    const requiredAverageGPA = futureCredits > 0 ? requiredFuturePoints / futureCredits : 0;
    
    const isAchievable = requiredAverageGPA <= 4.0 && requiredAverageGPA >= 0;
    
    return {
      remainingSemesters,
      futureCredits,
      requiredAverageGPA,
      isAchievable,
      creditsPerSemester
    };
  };

  const saveTarget = () => {
    if (!targetGPA || !targetSemester) {
      toast({
        title: "Missing Information",
        description: "Please enter both target GPA and target semester",
        variant: "destructive"
      });
      return;
    }

    const gpa = parseFloat(targetGPA);
    if (isNaN(gpa) || gpa < 0 || gpa > 4) {
      toast({
        title: "Invalid GPA",
        description: "GPA must be between 0.0 and 4.0",
        variant: "destructive"
      });
      return;
    }

    const { currentCredits, currentGPA } = getCurrentAcademicData();
    
    const targetData: TargetData = {
      targetGPA: gpa,
      targetSemester,
      currentCredits,
      currentGPA
    };

    localStorage.setItem('targetGrade', JSON.stringify(targetData));
    setSavedTarget(targetData);
    
    toast({
      title: "Target Saved",
      description: `Target GPA of ${gpa.toFixed(2)} set for ${targetSemester.replace('-', ' Semester ')}`
    });
  };

  const clearTarget = () => {
    localStorage.removeItem('targetGrade');
    setSavedTarget(null);
    setTargetGPA("");
    setTargetSemester("");
    
    toast({
      title: "Target Cleared",
      description: "Your target grade has been removed"
    });
  };

  const { currentCredits, currentGPA } = getCurrentAcademicData();
  const calculation = calculateRequiredGrades();
  const semesterOptions = generateSemesterOptions();
  const progressPercentage = savedTarget ? Math.min((currentGPA / savedTarget.targetGPA) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      {/* Set Target Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Set Your Target
          </CardTitle>
          <CardDescription>
            Set your academic goal and see what grades you need to achieve it
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="targetGPA">Target GPA</Label>
              <Input
                id="targetGPA"
                type="number"
                min="0"
                max="4"
                step="0.01"
                placeholder="3.50"
                value={targetGPA}
                onChange={(e) => setTargetGPA(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="targetSemester">Target Semester</Label>
              <Select value={targetSemester} onValueChange={setTargetSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="creditsPerSemester">Credits per Semester</Label>
              <Input
                id="creditsPerSemester"
                type="number"
                min="1"
                max="30"
                value={estimatedCreditsPerSemester}
                onChange={(e) => setEstimatedCreditsPerSemester(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={saveTarget} className="flex-1">
              Save Target
            </Button>
            {savedTarget && (
              <Button onClick={clearTarget} variant="outline">
                Clear Target
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Progress */}
      {savedTarget && (
        <Card className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Current Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{currentGPA.toFixed(2)}</div>
                <div className="text-sm opacity-90">Current GPA</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{savedTarget.targetGPA.toFixed(2)}</div>
                <div className="text-sm opacity-90">Target GPA</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{currentCredits}</div>
                <div className="text-sm opacity-90">Credits Completed</div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to Target</span>
                <span>{progressPercentage.toFixed(0)}%</span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="[&>div]:bg-accent bg-primary-dark/30" 
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grade Requirements */}
      {savedTarget && calculation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {calculation.isAchievable ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Grade Requirements
            </CardTitle>
            <CardDescription>
              What you need to achieve your target GPA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="text-xl font-bold">{calculation.remainingSemesters}</div>
                <div className="text-sm text-muted-foreground">Semesters Remaining</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="text-xl font-bold">{calculation.futureCredits}</div>
                <div className="text-sm text-muted-foreground">Future Credits</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="text-xl font-bold">{calculation.creditsPerSemester}</div>
                <div className="text-sm text-muted-foreground">Credits per Semester</div>
              </div>
              <div className={`text-center p-4 rounded-lg ${
                calculation.isAchievable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className="text-xl font-bold">
                  {calculation.requiredAverageGPA.toFixed(2)}
                </div>
                <div className="text-sm">Required Average GPA</div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              calculation.isAchievable 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {calculation.isAchievable ? (
                <div className="text-green-800">
                  <h4 className="font-semibold mb-2">🎯 Great! Your target is achievable!</h4>
                  <p>
                    You need to maintain an average GPA of <strong>{calculation.requiredAverageGPA.toFixed(2)}</strong> 
                    across your remaining {calculation.remainingSemesters} semesters to reach your target of {savedTarget.targetGPA.toFixed(2)}.
                  </p>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm">💡 <strong>Tips for success:</strong></p>
                    <ul className="text-sm list-disc list-inside ml-4 space-y-1">
                      <li>Aim for grades that give you {calculation.requiredAverageGPA.toFixed(1)}+ points per credit</li>
                      <li>Focus on higher-credit courses for maximum impact</li>
                      <li>Consider retaking courses if your institution allows GPA replacement</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-red-800">
                  <h4 className="font-semibold mb-2">⚠️ This target may be challenging</h4>
                  <p>
                    To reach your target GPA of {savedTarget.targetGPA.toFixed(2)}, you would need to maintain an average GPA of {calculation.requiredAverageGPA.toFixed(2)} 
                    across your remaining semesters, which exceeds the maximum possible GPA of 4.0.
                  </p>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm">💡 <strong>Consider these options:</strong></p>
                    <ul className="text-sm list-disc list-inside ml-4 space-y-1">
                      <li>Extend your target to a later semester</li>
                      <li>Adjust your target GPA to a more achievable level</li>
                      <li>Take additional courses to increase your credit base</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Target Set */}
      {!savedTarget && (
        <Card className="border-dashed">
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Target Set</h3>
            <p className="text-muted-foreground">
              Set your academic goal above to see personalized grade recommendations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};