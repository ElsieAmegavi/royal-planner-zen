import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Award, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
  points: number;
}

const gradePoints: { [key: string]: number } = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "F": 0.0
};

export const GPACalculator = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseName, setCourseName] = useState("");
  const [credits, setCredits] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const { toast } = useToast();

  const addCourse = () => {
    if (!courseName || !credits || !selectedGrade) {
      toast({
        title: "Missing Information",
        description: "Please fill in all course details",
        variant: "destructive"
      });
      return;
    }

    const newCourse: Course = {
      id: Date.now().toString(),
      name: courseName,
      credits: parseFloat(credits),
      grade: selectedGrade,
      points: gradePoints[selectedGrade]
    };

    setCourses([...courses, newCourse]);
    setCourseName("");
    setCredits("");
    setSelectedGrade("");
    
    toast({
      title: "Course Added",
      description: `${courseName} has been added to your GPA calculation`
    });
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const calculateGPA = () => {
    if (courses.length === 0) return 0;
    
    const totalPoints = courses.reduce((sum, course) => sum + (course.points * course.credits), 0);
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const currentGPA = calculateGPA();
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-accent-light/20 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">GPA Calculator</h1>
          <p className="text-muted-foreground">
            Calculate your semester GPA and track your academic performance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Course Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Course
              </CardTitle>
              <CardDescription>
                Enter your course details to calculate your GPA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="courseName">Course Name</Label>
                  <Input
                    id="courseName"
                    placeholder="e.g. Calculus I"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="credits">Credit Hours</Label>
                  <Input
                    id="credits"
                    type="number"
                    placeholder="3"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(gradePoints).map(([grade, points]) => (
                        <SelectItem key={grade} value={grade}>
                          {grade} ({points.toFixed(1)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={addCourse} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GPA Summary */}
          <Card className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Current GPA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">
                {currentGPA.toFixed(2)}
              </div>
              <div className="space-y-2 opacity-90">
                <p className="text-sm">Total Credits: {totalCredits}</p>
                <p className="text-sm">Courses: {courses.length}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{Math.min((currentGPA / 4.0) * 100, 100).toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={Math.min((currentGPA / 4.0) * 100, 100)} 
                    className="bg-primary-dark/30" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course List */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Courses
              </CardTitle>
              <CardDescription>
                {courses.length === 0 
                  ? "Add courses above to see them listed here"
                  : `${courses.length} course${courses.length !== 1 ? 's' : ''} added`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No courses added yet. Start by adding your first course above!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div 
                      key={course.id}
                      className="flex items-center justify-between p-4 bg-secondary rounded-lg border"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{course.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {course.credits} credit{course.credits !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-accent/10">
                          {course.grade}
                        </Badge>
                        <span className="text-sm font-medium w-12 text-center">
                          {course.points.toFixed(1)}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeCourse(course.id)}
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};