import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileSpreadsheet, AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from 'papaparse';

interface TimetableEntry {
  courseName: string;
  courseCode: string;
  instructor: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  semester: string;
  year: string;
}

interface BulkTimetableUploadProps {
  onUpload: (entries: TimetableEntry[]) => void;
}

export const BulkTimetableUpload: React.FC<BulkTimetableUploadProps> = ({ onUpload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [csvData, setCsvData] = useState<TimetableEntry[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const { toast } = useToast();

  const sampleData = [
    ['Course Name', 'Course Code', 'Instructor', 'Day', 'Start Time', 'End Time', 'Location', 'Semester', 'Year'],
    ['Introduction to Psychology', 'PSY101', 'Dr. Smith', 'Monday', '09:00', '10:30', 'Room 101', 'Fall', '2024'],
    ['Calculus I', 'MATH101', 'Prof. Johnson', 'Tuesday', '11:00', '12:30', 'Room 205', 'Fall', '2024'],
    ['English Literature', 'ENG201', 'Dr. Brown', 'Wednesday', '14:00', '15:30', 'Room 303', 'Fall', '2024']
  ];

  const downloadSample = () => {
    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timetable_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file.",
        variant: "destructive"
      });
      return;
    }

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const data = results.data as any[];
        const validEntries: TimetableEntry[] = [];
        
        data.forEach((row, index) => {
          if (row['Course Name'] && row['Day'] && row['Start Time'] && row['End Time']) {
            validEntries.push({
              courseName: row['Course Name'] || '',
              courseCode: row['Course Code'] || '',
              instructor: row['Instructor'] || '',
              day: row['Day'] || '',
              startTime: row['Start Time'] || '',
              endTime: row['End Time'] || '',
              location: row['Location'] || '',
              semester: row['Semester'] || 'Fall',
              year: row['Year'] || '2024'
            });
          }
        });

        if (validEntries.length === 0) {
          toast({
            title: "No Valid Entries",
            description: "Please check your CSV format and required fields.",
            variant: "destructive"
          });
          return;
        }

        setCsvData(validEntries);
        setShowPreview(true);
        setIsValid(true);
        
        toast({
          title: "File Uploaded",
          description: `Found ${validEntries.length} valid timetable entries.`
        });
      },
      error: (error) => {
        toast({
          title: "Upload Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive"
        });
      }
    });
  };

  const handleConfirmUpload = () => {
    onUpload(csvData);
    setIsOpen(false);
    setShowPreview(false);
    setCsvData([]);
    toast({
      title: "Timetable Imported",
      description: `Successfully imported ${csvData.length} classes to your timetable.`
    });
  };

  const dayColors: Record<string, string> = {
    Monday: "bg-blue-100 text-blue-800",
    Tuesday: "bg-green-100 text-green-800",
    Wednesday: "bg-yellow-100 text-yellow-800",
    Thursday: "bg-purple-100 text-purple-800",
    Friday: "bg-red-100 text-red-800",
    Saturday: "bg-gray-100 text-gray-800",
    Sunday: "bg-orange-100 text-orange-800"
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Bulk Upload Timetable
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Timetable</DialogTitle>
          <DialogDescription>
            Upload your complete semester timetable using a CSV file
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Sample Format */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Required Format
              </CardTitle>
              <CardDescription>
                Download the sample CSV file to see the expected format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Required columns: Course Name, Day, Start Time, End Time
                </p>
                <p className="text-sm text-muted-foreground">
                  Optional columns: Course Code, Instructor, Location, Semester, Year
                </p>
                <Button onClick={downloadSample} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Your CSV File</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="mb-4"
              />
            </CardContent>
          </Card>

          {/* Preview */}
          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isValid ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  Preview ({csvData.length} entries)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {csvData.slice(0, 10).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{entry.courseName}</h4>
                          {entry.courseCode && (
                            <Badge variant="secondary">{entry.courseCode}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge className={dayColors[entry.day] || "bg-gray-100 text-gray-800"}>
                            {entry.day}
                          </Badge>
                          <span>{entry.startTime} - {entry.endTime}</span>
                          {entry.location && <span>📍 {entry.location}</span>}
                          {entry.instructor && <span>👨‍🏫 {entry.instructor}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {csvData.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center">
                      ... and {csvData.length - 10} more entries
                    </p>
                  )}
                </div>
                
                <div className="flex gap-3 mt-4">
                  <Button onClick={handleConfirmUpload} className="flex-1">
                    Import {csvData.length} Classes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPreview(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};