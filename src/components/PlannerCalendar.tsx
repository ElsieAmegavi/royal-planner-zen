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
import { Plus, Edit, Trash2, Clock, BookOpen, AlertTriangle, FileText } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export interface PlannerEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: "class" | "assignment" | "deadline" | "quiz" | "exam" | "study";
  time?: string;
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
    time: ""
  });
  const { toast } = useToast();

  const getDayEvents = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
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
      time: formData.time || undefined
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
      time: event.time || ""
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
            time: formData.time || undefined
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
      time: ""
    });
    setEditingEvent(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Calendar View
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
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
        </CardContent>
      </Card>

      {/* Events for Selected Day */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a Date"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {selectedDayEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No events scheduled for this day
              </p>
            ) : (
              selectedDayEvents.map((event) => {
                const Icon = eventTypeIcons[event.type];
                return (
                  <div
                    key={event.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <h4 className="font-medium">{event.title}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEvent(event)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {event.time && (
                      <p className="text-sm text-muted-foreground">
                        {event.time}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                    <Badge className={eventTypeColors[event.type]}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};