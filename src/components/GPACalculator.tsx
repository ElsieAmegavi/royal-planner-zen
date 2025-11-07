import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Award, TrendingUp, Settings, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { semestersAPI, gradeSettingsAPI } from "@/services/api";
import { Course, SemesterData } from "@/types";
import jsPDF from 'jspdf';

const getGradePoints = async (): Promise<{ [key: string]: number }> => {
  try {
    const gradeSettings = await gradeSettingsAPI.getGradeSettings();
    return gradeSettings || {};
  } catch (error) {
    console.error('Failed to load grade settings:', error);
    // Fallback to localStorage
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
  }
};

export const GPACalculator = () => {
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [currentSemester, setCurrentSemester] = useState<string>("");
  const [currentSemesterData, setCurrentSemesterData] = useState<SemesterData | null>(null);
  const [courseName, setCourseName] = useState("");
  const [credits, setCredits] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [gradePoints, setGradePoints] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const hasLoadedRef = useRef(false);


  // Helper function to find the latest semester with courses
  const findLatestSemesterWithCourses = (semesters: SemesterData[]): string | null => {
    // Filter semesters that have courses
    const semestersWithCourses = semesters.filter(semester => 
      semester.courses && semester.courses.length > 0
    );
    
    if (semestersWithCourses.length === 0) {
      return null;
    }
    
    // Sort by year and semester to find the latest
    const sortedSemesters = semestersWithCourses.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year; // Latest year first
      }
      return b.semester - a.semester; // Latest semester first
    });
    
    return sortedSemesters[0].id;
  };

  // Load data on component mount
  useEffect(() => {
    if (hasLoadedRef.current) return; // Prevent multiple loads
    
    const createFirstSemester = async () => {
      try {
        // Create Year 1, Semester 1
        const createdSemester = await semestersAPI.createSemester({
          year: 1,
          semester: 1
        });
        
        const newSemester = {
          id: createdSemester.id.toString(),
          year: 1,
          semester: 1,
          courses: [],
          gpa: 0
        };
        
        setSemesters([newSemester]);
        setCurrentSemester(createdSemester.id.toString());
        setCurrentSemesterData(newSemester);
        
        // Save to localStorage
        localStorage.setItem('semesterData', JSON.stringify([newSemester]));
        
        toast({
          title: "First Semester Created",
          description: "Year 1 - Semester 1 has been created for you."
        });
      } catch (error) {
        console.error('Failed to create first semester:', error);
        toast({
          title: "Error",
          description: "Failed to create semester. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        hasLoadedRef.current = true;
        
        // Clean up any existing duplicates first
        try {
          await semestersAPI.cleanupDuplicates();
        } catch (error) {
          // Silently handle cleanup failures
        }
        
        // Load semesters from backend (now includes courses)
        const backendSemesters = await semestersAPI.getSemesters();
        
        if (backendSemesters && backendSemesters.length > 0) {
          // We have existing semesters, use them
          setSemesters(backendSemesters);
          
          // Set semesters data
          
          // Auto-select the latest semester with courses
          const latestSemesterWithCourses = findLatestSemesterWithCourses(backendSemesters);
          
          if (latestSemesterWithCourses) {
            setCurrentSemester(latestSemesterWithCourses);
            const selectedSemesterData = backendSemesters.find(s => s.id === latestSemesterWithCourses);
            setCurrentSemesterData(selectedSemesterData || null);
          } else {
            // If no semesters have courses, select the last semester
            setCurrentSemester(backendSemesters[backendSemesters.length - 1].id.toString());
            setCurrentSemesterData(backendSemesters[backendSemesters.length - 1]);
          }
        } else {
          // No semesters exist, create the first one
          await createFirstSemester();
        }
        
        // Load grade settings from backend
        const gradeSettings = await getGradePoints();
        setGradePoints(gradeSettings);
        
      } catch (error) {
        console.error('Failed to load data from backend:', error);
        
        // Fallback to localStorage
        const savedSemesters = localStorage.getItem('semesterData');
        if (savedSemesters) {
          const parsed = JSON.parse(savedSemesters);
          setSemesters(parsed);
          
          if (parsed.length > 0) {
            const latestSemesterWithCourses = findLatestSemesterWithCourses(parsed);
            
            if (latestSemesterWithCourses) {
              setCurrentSemester(latestSemesterWithCourses);
              const selectedSemesterData = parsed.find(s => s.id === latestSemesterWithCourses);
              setCurrentSemesterData(selectedSemesterData || null);
            } else {
              setCurrentSemester(parsed[parsed.length - 1].id);
              setCurrentSemesterData(parsed[parsed.length - 1]);
            }
          }
        }
        
        const gradeSettings = await getGradePoints();
        console.log('Fallback gradeSettings loaded:', gradeSettings);
        console.log('Fallback gradeSettings keys:', Object.keys(gradeSettings));
        setGradePoints(gradeSettings);
        
        toast({
          title: "Offline Mode",
          description: "Using cached data. Some features may be limited.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]); // Include toast dependency

  const getCurrentSemesterData = (selectedSemester: string) => {
    const result = (semesters || []).find(s => s.id === selectedSemester);
    return result;
  };

  // Update current semester data when it changes
  useEffect(() => {
    if (currentSemesterData) {
      // Semester data is available
    }
  }, [currentSemesterData]);

  // Update grade points when they change
  useEffect(() => {
    // Grade points are available
  }, [gradePoints]);

  const generateSemesters = useCallback(() => {
    const savedYears = localStorage.getItem('academicYears') || '4';
    const years = parseInt(savedYears);
    const semesterList = [];
    
    for (let year = 1; year <= years; year++) {
      for (let sem = 1; sem <= 2; sem++) {
        const id = `${year}-${sem}`;
        if (!(semesters || []).find(s => s.id === id)) {
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
  }, [semesters]);

  const handleSemesterChange = (selectedSemester: string) => {
    setCurrentSemester(selectedSemester);
    const currentSemesterResult = getCurrentSemesterData(selectedSemester);
    setCurrentSemesterData(currentSemesterResult || null);
  };

  const addNewSemester = useCallback(async () => {
    try {
      const newSemesters = generateSemesters();
      if (newSemesters.length === 0) {
        toast({
          title: "No New Semesters",
          description: "All semesters have already been generated",
          variant: "destructive"
        });
        return;
      }

      // Only create the first missing semester to avoid duplicates
      const firstNewSemester = newSemesters[0];
      
      // Create semester in backend
      const createdSemester = await semestersAPI.createSemester({
        year: firstNewSemester.year,
        semester: firstNewSemester.semester
      });

      // Update the semester with the actual ID from backend
      const semesterWithId = {
        ...firstNewSemester,
        id: createdSemester.id.toString()
      };

      // Update local state
      setSemesters(prev => [...(prev || []), semesterWithId]);
      if (!currentSemester) {
        setCurrentSemester(createdSemester.id.toString());
        setCurrentSemesterData(semesterWithId);
      }
      
      // Save to localStorage
      const updatedSemesters = [...(semesters || []), semesterWithId];
      localStorage.setItem('semesterData', JSON.stringify(updatedSemesters));
      
      toast({
        title: "Semester Added",
        description: `Year ${firstNewSemester.year} - Semester ${firstNewSemester.semester} created successfully`
      });
    } catch (error) {
      console.error('Failed to add semester:', error);
      toast({
        title: "Error",
        description: "Failed to add semester. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast, generateSemesters, currentSemester, semesters]);


  const addCourse = async () => {
    if (!courseName || !credits || !selectedGrade || !currentSemester) {
      toast({
        title: "Missing Information",
        description: "Please select a semester and fill in all course details",
        variant: "destructive"
      });
      return;
    }

    try {
      // Add course to backend and get the response with the actual database ID
      const response = await semestersAPI.addCourse(parseInt(currentSemester), {
        name: courseName,
        credits: parseFloat(credits),
        grade: selectedGrade,
        points: gradePoints[selectedGrade]
      });


      // Create the new course object with the actual database ID
      const newCourse: Course = {
        id: response.id.toString(),
        name: courseName,
        credits: parseFloat(credits),
        grade: selectedGrade,
        points: gradePoints[selectedGrade]
      };

      // Update the semesters state immediately with the new course
      setSemesters(prevSemesters => {
        return prevSemesters.map(semester => {
          if (semester.id === currentSemester) {
            const updatedCourses = [...(semester.courses || []), newCourse];
            const totalPoints = updatedCourses.reduce((sum, course) => sum + (course.points * course.credits), 0);
            const totalCredits = updatedCourses.reduce((sum, course) => sum + course.credits, 0);
            const newGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
            
            return {
              ...semester,
              courses: updatedCourses,
              gpa: newGPA
            };
          }
          return semester;
        });
      });

      // Update currentSemesterData to show the new course immediately
      setCurrentSemesterData(prevData => {
        if (prevData && prevData.id === currentSemester) {
          const updatedCourses = [...(prevData.courses || []), newCourse];
          const totalPoints = updatedCourses.reduce((sum, course) => sum + (course.points * course.credits), 0);
          const totalCredits = updatedCourses.reduce((sum, course) => sum + course.credits, 0);
          const newGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
          
          return {
            ...prevData,
            courses: updatedCourses,
            gpa: newGPA
          };
        }
        return prevData;
      });

      // Clear form fields
      setCourseName("");
      setCredits("");
      setSelectedGrade("");
      
      toast({
        title: "Course Added",
        description: `${courseName} has been added to Year ${currentSemesterData?.year} - Semester ${currentSemesterData?.semester}`
      });
    } catch (error) {
      console.error('Failed to add course:', error);
      toast({
        title: "Error",
        description: "Failed to add course. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removeCourse = async (courseId: string) => {
    try {
      // Remove course from backend
      await semestersAPI.deleteCourse(parseInt(courseId));

      // Update the semesters state immediately by removing the course
      setSemesters(prevSemesters => {
        return prevSemesters.map(semester => {
          if (semester.id === currentSemester) {
            const updatedCourses = (semester.courses || []).filter(course => course.id !== courseId);
            const totalPoints = updatedCourses.reduce((sum, course) => sum + (course.points * course.credits), 0);
            const totalCredits = updatedCourses.reduce((sum, course) => sum + course.credits, 0);
            const newGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
            
            return {
              ...semester,
              courses: updatedCourses,
              gpa: newGPA
            };
          }
          return semester;
        });
      });

      // Update currentSemesterData to remove the course immediately
      setCurrentSemesterData(prevData => {
        if (prevData && prevData.id === currentSemester) {
          const updatedCourses = (prevData.courses || []).filter(course => course.id !== courseId);
          const totalPoints = updatedCourses.reduce((sum, course) => sum + (course.points * course.credits), 0);
          const totalCredits = updatedCourses.reduce((sum, course) => sum + course.credits, 0);
          const newGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
          
          return {
            ...prevData,
            courses: updatedCourses,
            gpa: newGPA
          };
        }
        return prevData;
      });

      toast({
        title: "Course Removed",
        description: "Course has been removed from the semester"
      });
    } catch (error) {
      console.error('Failed to remove course:', error);
      toast({
        title: "Error",
        description: "Failed to remove course. Please try again.",
        variant: "destructive"
      });
    }
  };

  const calculateSemesterGPA = (courses: Course[]) => {
    if (courses.length === 0) return 0;
    const totalPoints = courses.reduce((sum, course) => sum + (course.points * course.credits), 0);
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const calculateCumulativeGPA = () => {
    const allCourses = semesters.some(s => 'courses' in s) ? semesters.flatMap(s => s.courses) : null;
    if (!allCourses) return 0;
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
    doc.text(`Total Credits: ${(semesters || []).flatMap(s => s.courses).reduce((sum, course) => sum + course.credits, 0)}`, 20, 70);
    doc.text(`Total Semesters: ${(semesters || []).length}`, 20, 80);
    
    let yPosition = 100;
    
    (semesters || []).forEach((semester, index) => {
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

  const currentSemesterResult = getCurrentSemesterData(currentSemester);
  //TODO: check to see whether to set the current semester data to the current semester result
  const currentSemesterGPA = currentSemesterResult?.gpa || 0;
  const currentSemesterCredits = currentSemesterResult?.courses?.reduce((sum, course) => sum + course.credits, 0) || 0;
  const cumulativeGPA = calculateCumulativeGPA();
  const totalCredits = semesters.some(s => s.courses) 
    ? semesters.flatMap(s => s.courses).reduce((sum, course) => sum + course.credits, 0)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-accent-light/20 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your academic data...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">GPA Calculator</h1>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Calculate your semester GPA and track your academic performance
                  </p>
                </div>
                <Button variant="outline" onClick={() => window.location.href = '/settings'} className="w-full sm:w-auto">
                  <Settings className="h-4 w-4 mr-2" />
                  Grade Settings
                </Button>
              </div>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
                <Select value={currentSemester} onValueChange={handleSemesterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {(semesters || []).map((semester) => (
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
                  <p className="text-sm">
                    {currentSemester ? `Year ${currentSemesterData?.year} - Sem ${currentSemesterData?.semester}` : 'No semester selected'}
                    {/* {currentSemester ? `Year ${currentSemester.split('-')[0]} - Sem ${currentSemester.split('-')[1]}` : 'No semester selected'} */}

                    </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course List */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {currentSemester ? `Year ${currentSemesterData?.year} - Semester ${currentSemesterData?.semester} Courses` : 'Select a Semester'}
                {/* {currentSemester ? `Year ${currentSemester.split('-')[0]} - Semester ${currentSemester.split('-')[1]} Courses` : 'Select a Semester'} */}

              </CardTitle>
              <CardDescription>
                {currentSemesterData?.courses?.length === 0 
                  ? "Add courses above to see them listed here"
                  : `${currentSemesterData?.courses?.length || 0} course${(currentSemesterData?.courses?.length || 0) !== 1 ? 's' : ''} added`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!currentSemesterData || currentSemesterData.courses?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No courses added yet. Start by adding your first course above!</p>
                </div>
              ) : (
                  <div className="space-y-3">
                    {currentSemesterData.courses?.map((course) => (
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
                {(semesters || []).map((semester) => (
                  <div
                    key={semester.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      semester.id === currentSemester 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                    onClick={() => handleSemesterChange(semester.id)}
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
                        {semester.courses?.length || 0} courses • {semester.courses?.reduce((sum, c) => sum + c.credits, 0) || 0} credits
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        </>
      )}
      </div>
    </div>
  );
};