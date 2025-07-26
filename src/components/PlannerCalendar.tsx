import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Clock, BookOpen, AlertTriangle, FileText, Calendar as CalendarIcon } from "lucide-react";
import { format, isSameDay, addDays, startOfWeek, isAfter, isBefore, addWeeks } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { TimetableDialog } from "./TimetableDialog";
import { BulkTimetableUpload } from "./BulkTimetableUpload";
import { WorkloadBalancer } from "./WorkloadBalancer";

export interface PlannerEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: "class" | "assignment" | "deadline" | "quiz" | "exam" | "study";
  time?: string;
  priority?: "low" | "medium" | "high";
  reminders?: string[];
  isRecurring?: boolean;
  recurringDays?: number[]; // 0-6 for Sunday-Saturday
  courseCode?: string;
  location?: string;
}

const eventTypeIcons = {
  class: BookOpen,
  assignment: FileText,
  deadline: AlertTriangle,
  quiz: FileText,
  exam: AlertTriangle,
  study: Clock,
};

const eventTypeColors = {
  class: "bg-primary text-primary-foreground",
  assignment: "bg-accent text-accent-foreground",
  deadline: "bg-destructive text-destructive-foreground",
  quiz: "bg-secondary text-secondary-foreground",
  exam: "bg-destructive text-destructive-foreground",
  study: "bg-muted text-muted-foreground",
};

// Sample dummy data
const initialEvents: PlannerEvent[] = [
  {
    id: "1",
    title: "Advanced Mathematics",
    description: "Linear Algebra lecture",
    date: new Date(2025, 0, 27),
    type: "class",
    time: "09:00"
  },
  {
    id: "2",
    title: "Physics Lab Report",
    description: "Submit quantum mechanics lab report",
    date: new Date(2025, 0, 28),
    type: "assignment",
    time: "23:59"
  },
  {
    id: "3",
    title: "Chemistry Quiz",
    description: "Organic chemistry quiz",
    date: new Date(2025, 0, 29),
    type: "quiz",
    time: "14:00"
  },
  {
    id: "4",
    title: "Project Deadline",
    description: "Software engineering final project",
    date: new Date(2025, 0, 30),
    type: "deadline",
    time: "23:59"
  }
];

export const PlannerCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<PlannerEvent[]>(initialEvents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PlannerEvent | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "class" as PlannerEvent["type"],
    time: "",
    priority: "medium" as PlannerEvent["priority"],
    reminders: [] as string[]
  });
  const { toast } = useToast();

  const generateRecurringEvents = (baseEvent: PlannerEvent) => {
    if (!baseEvent.isRecurring || !baseEvent.recurringDays) return [];
    
    const events: PlannerEvent[] = [];
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    
    // Generate events for next 16 weeks
    for (let week = 0; week < 16; week++) {
      baseEvent.recurringDays.forEach(dayOfWeek => {
        const eventDate = addDays(weekStart, week * 7 + (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        events.push({
          ...baseEvent,
          id: `${baseEvent.id}-${week}-${dayOfWeek}`,
          date: eventDate
        });
      });
    }
    
    return events;
  };

  const getAllEventsWithRecurring = () => {
    const allEvents = [...events];
    const recurringEvents = events
      .filter(event => event.isRecurring)
      .flatMap(event => generateRecurringEvents(event));
    
    return [...allEvents.filter(event => !event.isRecurring), ...recurringEvents];
  };

  const getDayEvents = (date: Date) => {
    const allEvents = getAllEventsWithRecurring();
    return allEvents.filter(event => isSameDay(event.date, date));
  };

  const getUpcomingEvents = () => {
    const allEvents = getAllEventsWithRecurring();
    const nextTwoWeeks = addWeeks(new Date(), 2);
    return allEvents
      .filter(event => 
        isAfter(event.date, new Date()) &&
        isBefore(event.date, nextTwoWeeks)
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  };

  const handleAddTimetable = (timetable: PlannerEvent) => {
    setEvents([...events, timetable]);
  };

  interface BulkTimetableEntry {
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

  const handleBulkUpload = (entries: BulkTimetableEntry[]) => {
    const dayMap: { [key: string]: number } = {
      'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 0
    };

    const newEvents: PlannerEvent[] = entries.map(entry => ({
      id: `bulk-${Date.now()}-${Math.random()}`,
      title: entry.courseName,
      description: `${entry.courseCode ? entry.courseCode + ' - ' : ''}${entry.instructor ? 'Instructor: ' + entry.instructor : ''}${entry.location ? ' | Location: ' + entry.location : ''}`,
      date: new Date(), // This will be overridden by recurring logic
      type: "class" as PlannerEvent["type"],
      time: entry.startTime,
      isRecurring: true,
      recurringDays: [dayMap[entry.day] || 1],
      courseCode: entry.courseCode,
      location: entry.location
    }));
    
    setEvents(prev => [...prev, ...newEvents]);
  };

  const selectedDayEvents = selectedDate ? getDayEvents(selectedDate) : [];

  const handleAddEvent = () => {
    if (!selectedDate || !formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    const newEvent: PlannerEvent = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      date: selectedDate,
      type: formData.type,
      time: formData.time || undefined,
      priority: formData.priority,
      reminders: formData.reminders
    };

    setEvents([...events, newEvent]);
    resetForm();
    toast({
      title: "Event Added",
      description: `${formData.title} has been added to your calendar`
    });
  };

  const handleEditEvent = (event: PlannerEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      type: event.type,
      time: event.time || "",
      priority: event.priority || "medium",
      reminders: event.reminders || []
    });
    setIsDialogOpen(true);
  };

  const handleUpdateEvent = () => {
    if (!editingEvent || !formData.title.trim()) return;

    const updatedEvents = events.map(event =>
      event.id === editingEvent.id
        ? {
            ...event,
            title: formData.title,
            description: formData.description,
            type: formData.type,
            time: formData.time || undefined,
            priority: formData.priority,
            reminders: formData.reminders
          }
        : event
    );

    setEvents(updatedEvents);
    resetForm();
    toast({
      title: "Event Updated",
      description: `${formData.title} has been updated`
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
    toast({
      title: "Event Deleted",
      description: "Event has been removed from your calendar"
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "class",
      time: "",
      priority: "medium",
      reminders: []
    });
    setEditingEvent(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-4">
        <TimetableDialog onAddTimetable={handleAddTimetable} />
        <BulkTimetableUpload onUpload={handleBulkUpload} />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Edit Event" : "Add New Event"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Event title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as PlannerEvent["type"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class">Class</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="study">Study Session</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as PlannerEvent["priority"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reminders">Reminder Settings</Label>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">When to send reminders:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {["30mins", "1hour", "2hours", "1day", "1week"].map((reminder) => (
                      <label key={reminder} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.reminders.includes(reminder)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, reminders: [...formData.reminders, reminder] });
                            } else {
                              setFormData({ ...formData, reminders: formData.reminders.filter(r => r !== reminder) });
                            }
                          }}
                          className="rounded border-input"
                        />
                        <span className="text-sm">
                          {reminder === "30mins" ? "30 minutes before" :
                           reminder === "1hour" ? "1 hour before" :
                           reminder === "2hours" ? "2 hours before" :
                           reminder === "1day" ? "1 day before" :
                           "1 week before"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={editingEvent ? handleUpdateEvent : handleAddEvent}>
                  {editingEvent ? "Update" : "Add"} Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar with embedded events - Reduced size */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border [&_.rdp-table]:text-sm"
                  modifiers={{
                    hasEvents: (date) => getDayEvents(date).length > 0
                  }}
                  modifiersStyles={{
                    hasEvents: {
                      fontWeight: "bold",
                      backgroundColor: "hsl(var(--primary))",
                      color: "hsl(var(--primary-foreground))"
                    }
                  }}
                />
              </div>
              
              {/* Events for Selected Day - Inside Calendar */}
              <div className="border-l pl-4 lg:col-span-2">
                <h3 className="font-semibold mb-3">
                  {selectedDate ? format(selectedDate, "MMMM d") : "Select a Date"}
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedDayEvents.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No events scheduled
                    </p>
                  ) : (
                    selectedDayEvents.map((event) => {
                      const Icon = eventTypeIcons[event.type];
                      return (
                        <div
                          key={event.id}
                          className="border rounded-lg p-2 space-y-1"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-1">
                              <Icon className="h-3 w-3" />
                              <h4 className="font-medium text-sm">{event.title}</h4>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditEvent(event)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-2 w-2" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEvent(event.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="h-2 w-2" />
                              </Button>
                            </div>
                          </div>
                          {event.time && (
                            <p className="text-xs text-muted-foreground">
                              {event.time}
                            </p>
                          )}
                          {event.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {event.description}
                            </p>
                          )}
                          <Badge className={`text-xs ${eventTypeColors[event.type]}`}>
                            {event.type}
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getUpcomingEvents().map((event) => {
                const Icon = eventTypeIcons[event.type];
                return (
                  <div key={event.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <h4 className="font-medium text-sm">{event.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(event.date, "EEEE, MMM d")} at {event.time || "All day"}
                    </p>
                    <Badge className={`text-xs ${eventTypeColors[event.type]}`}>
                      {event.type}
                    </Badge>
                  </div>
                );
              })}
              {getUpcomingEvents().length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No upcoming events
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Workload Balancer */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Workload Balancer</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkloadBalancer />
        </CardContent>
      </Card>
    </div>
  );
};