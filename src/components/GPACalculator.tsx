import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Award, TrendingUp, Settings, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
  points: number;
}

interface SemesterData {
  id: string;
  year: number;
  semester: number;
  courses: Course[];
  gpa: number;
}

const getGradePoints = (): { [key: string]: number } => {
  const saved = localStorage.getItem('gradeSettings');
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    "A+": 4.0, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0, "F": 0.0
  };
};

export const GPACalculator = () => {
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [currentSemester, setCurrentSemester] = useState<string>("");
  const [courseName, setCourseName] = useState("");
  const [credits, setCredits] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [gradePoints, setGradePoints] = useState(getGradePoints());
  const { toast } = useToast();

  // Load data on component mount
  useEffect(() => {
    const savedSemesters = localStorage.getItem('semesterData');
    if (savedSemesters) {
      const parsed = JSON.parse(savedSemesters);
      setSemesters(parsed);
      if (parsed.length > 0 && !currentSemester) {
        setCurrentSemester(parsed[parsed.length - 1].id);
      }
    }
    
    // Listen for grade settings changes
    const handleStorageChange = () => {
      setGradePoints(getGradePoints());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save to localStorage whenever semesters change
  useEffect(() => {
    if (semesters.length > 0) {
      localStorage.setItem('semesterData', JSON.stringify(semesters));
    }
  }, [semesters]);

  const getCurrentSemesterData = () => {
    return semesters.find(s => s.id === currentSemester);
  };

  const generateSemesters = () => {
    const savedYears = localStorage.getItem('academicYears') || '4';
    const years = parseInt(savedYears);
    const semesterList = [];
    
    for (let year = 1; year <= years; year++) {
      for (let sem = 1; sem <= 2; sem++) {
        const id = `${year}-${sem}`;
        if (!semesters.find(s => s.id === id)) {
          semesterList.push({
            id,
            year,
            semester: sem,
            courses: [],
            gpa: 0
          });
        }
      }
    }
    return semesterList;
  };

  const addNewSemester = () => {
    const newSemesters = generateSemesters();
    if (newSemesters.length > 0) {
      setSemesters([...semesters, ...newSemesters]);
      if (!currentSemester) {
        setCurrentSemester(newSemesters[0].id);
      }
    }
  };

  useEffect(() => {
    if (semesters.length === 0) {
      addNewSemester();
    }
  }, []);

  const addCourse = () => {
    if (!courseName || !credits || !selectedGrade || !currentSemester) {
      toast({
        title: "Missing Information",
        description: "Please select a semester and fill in all course details",
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

    setSemesters(prev => prev.map(semester => {
      if (semester.id === currentSemester) {
        const updatedCourses = [...semester.courses, newCourse];
        const gpa = calculateSemesterGPA(updatedCourses);
        return { ...semester, courses: updatedCourses, gpa };
      }
      return semester;
    }));

    setCourseName("");
    setCredits("");
    setSelectedGrade("");
    
    toast({
      title: "Course Added",
      description: `${courseName} has been added to ${currentSemester.replace('-', ' Semester ')}`
    });
  };

  const removeCourse = (courseId: string) => {
    setSemesters(prev => prev.map(semester => {
      if (semester.id === currentSemester) {
        const updatedCourses = semester.courses.filter(course => course.id !== courseId);
        const gpa = calculateSemesterGPA(updatedCourses);
        return { ...semester, courses: updatedCourses, gpa };
      }
      return semester;
    }));
  };

  const calculateSemesterGPA = (courses: Course[]) => {
    if (courses.length === 0) return 0;
    
    const totalPoints = courses.reduce((sum, course) => sum + (course.points * course.credits), 0);
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const calculateCumulativeGPA = () => {
    const allCourses = semesters.flatMap(s => s.courses);
    return calculateSemesterGPA(allCourses);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();
    
    // Header
    doc.setFontSize(20);
    doc.text('Academic Performance Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${currentDate}`, 20, 30);
    
    // Cumulative GPA
    doc.setFontSize(16);
    doc.text('Academic Summary', 20, 50);
    doc.setFontSize(12);
    doc.text(`Cumulative GPA: ${calculateCumulativeGPA().toFixed(2)}`, 20, 60);
    doc.text(`Total Credits: ${semesters.flatMap(s => s.courses).reduce((sum, course) => sum + course.credits, 0)}`, 20, 70);
    doc.text(`Total Semesters: ${semesters.length}`, 20, 80);
    
    let yPosition = 100;
    
    semesters.forEach((semester, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Semester header
      doc.setFontSize(14);
      doc.text(`Year ${semester.year} - Semester ${semester.semester}`, 20, yPosition);
      doc.text(`GPA: ${semester.gpa.toFixed(2)}`, 140, yPosition);
      yPosition += 10;
      
      // Course headers
      doc.setFontSize(10);
      doc.text('Course Name', 20, yPosition);
      doc.text('Credits', 80, yPosition);
      doc.text('Grade', 110, yPosition);
      doc.text('Points', 140, yPosition);
      yPosition += 5;
      
      // Courses
      semester.courses.forEach(course => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(course.name.substring(0, 25), 20, yPosition);
        doc.text(course.credits.toString(), 80, yPosition);
        doc.text(course.grade, 110, yPosition);
        doc.text(course.points.toFixed(2), 140, yPosition);
        yPosition += 5;
      });
      
      yPosition += 10;
    });
    
    doc.save(`Academic_Report_${currentDate.replace(/\//g, '_')}.pdf`);
    toast({
      title: "PDF Generated",
      description: "Your academic report has been downloaded successfully."
    });
  };

  const currentSemesterData = getCurrentSemesterData();
  const currentSemesterGPA = currentSemesterData?.gpa || 0;
  const currentSemesterCredits = currentSemesterData?.courses.reduce((sum, course) => sum + course.credits, 0) || 0;
  const cumulativeGPA = calculateCumulativeGPA();
  const totalCredits = semesters.flatMap(s => s.courses).reduce((sum, course) => sum + course.credits, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-accent-light/20 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">GPA Calculator</h1>
              <p className="text-muted-foreground">
                Calculate your semester GPA and track your academic performance
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/settings'}>
              <Settings className="h-4 w-4 mr-2" />
              Grade Settings
            </Button>
          </div>
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
              <div>
                <Label htmlFor="semester">Select Semester</Label>
                <Select value={currentSemester} onValueChange={setCurrentSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id}>
                        Year {semester.year} - Semester {semester.semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-accent to-accent-dark text-accent-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Cumulative GPA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl font-bold">
                    {cumulativeGPA.toFixed(2)}
                  </div>
                  <Button
                    onClick={exportToPDF}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
                <div className="space-y-2 opacity-90">
                  <p className="text-sm">Total Credits: {totalCredits}</p>
                  <p className="text-sm">All Semesters</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{Math.min((cumulativeGPA / 4.0) * 100, 100).toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={Math.min((cumulativeGPA / 4.0) * 100, 100)} 
                      className="[&>div]:bg-primary bg-primary/20" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Current Semester
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {currentSemesterGPA.toFixed(2)}
                </div>
                <div className="space-y-2 opacity-90">
                  <p className="text-sm">Credits: {currentSemesterCredits}</p>
                  <p className="text-sm">{currentSemester ? `Year ${currentSemester.split('-')[0]} - Sem ${currentSemester.split('-')[1]}` : 'No semester selected'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course List */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {currentSemester ? `Year ${currentSemester.split('-')[0]} - Semester ${currentSemester.split('-')[1]} Courses` : 'Select a Semester'}
              </CardTitle>
              <CardDescription>
                {currentSemesterData?.courses.length === 0 
                  ? "Add courses above to see them listed here"
                  : `${currentSemesterData?.courses.length || 0} course${(currentSemesterData?.courses.length || 0) !== 1 ? 's' : ''} added`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!currentSemesterData || currentSemesterData.courses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No courses added yet. Start by adding your first course above!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentSemesterData.courses.map((course) => (
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

          {/* Semester Overview */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>All Semesters Overview</CardTitle>
              <CardDescription>Track your academic progress across all semesters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {semesters.map((semester) => (
                  <div
                    key={semester.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      semester.id === currentSemester 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                    onClick={() => setCurrentSemester(semester.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">
                        Year {semester.year} - Sem {semester.semester}
                      </h3>
                      {semester.id === currentSemester && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{semester.gpa.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {semester.courses.length} courses • {semester.courses.reduce((sum, c) => sum + c.credits, 0)} credits
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};