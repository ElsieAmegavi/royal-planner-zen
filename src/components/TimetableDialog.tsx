import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PlannerEvent } from "./PlannerCalendar";

const daysOfWeek = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" }
];

interface TimetableDialogProps {
  onAddTimetable: (timetable: PlannerEvent) => void;
}

export const TimetableDialog = ({ onAddTimetable }: TimetableDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseCode: "",
    location: "",
    time: "",
    selectedDays: [] as number[]
  });
  const { toast } = useToast();

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day].sort()
    }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || formData.selectedDays.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in required fields and select at least one day",
        variant: "destructive"
      });
      return;
    }

    const timetableEvent: PlannerEvent = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      date: new Date(), // This will be overridden for recurring events
      type: "class",
      time: formData.time,
      isRecurring: true,
      recurringDays: formData.selectedDays,
      courseCode: formData.courseCode,
      location: formData.location
    };

    onAddTimetable(timetableEvent);
    resetForm();
    toast({
      title: "Timetable Added",
      description: `${formData.title} has been added to your timetable`
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      courseCode: "",
      location: "",
      time: "",
      selectedDays: []
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Add Timetable
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Course Timetable</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="courseCode">Course Code</Label>
            <Input
              id="courseCode"
              value={formData.courseCode}
              onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
              placeholder="e.g., CS101"
            />
          </div>
          <div>
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Introduction to Computer Science"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Course description"
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Room 101, Building A"
            />
          </div>
          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
          <div>
            <Label>Days of Week *</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {daysOfWeek.map((day) => (
                <Button
                  key={day.value}
                  variant={formData.selectedDays.includes(day.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDayToggle(day.value)}
                  className="justify-start"
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add Timetable
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};