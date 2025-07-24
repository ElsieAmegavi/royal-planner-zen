import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, AlertTriangle, Clock } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, isAfter, isBefore, addWeeks } from "date-fns";
import { PlannerEvent } from "@/components/PlannerCalendar";

// Dummy data for demo
const sampleEvents: PlannerEvent[] = [
  {
    id: "1",
    title: "Physics 101",
    description: "Quantum mechanics lecture",
    date: new Date(2025, 0, 27), // Monday
    type: "class",
    time: "09:00",
    priority: "medium",
    reminders: ["30mins"]
  },
  {
    id: "2",
    title: "Math Assignment",
    description: "Calculus Problem Set",
    date: new Date(2025, 0, 29), // Wednesday
    type: "assignment",
    time: "23:59",
    priority: "high",
    reminders: ["2hours", "1hour"]
  },
  {
    id: "3",
    title: "Chemistry Lab",
    description: "Organic Chemistry Lab Report Due",
    date: new Date(2025, 1, 3), // Next week Monday
    type: "deadline",
    time: "23:59",
    priority: "high",
    reminders: ["1day", "2hours"]
  },
  {
    id: "4",
    title: "Biology Quiz",
    description: "Cell Biology Quiz",
    date: new Date(2025, 1, 5), // Next week Wednesday
    type: "quiz",
    time: "14:00",
    priority: "medium",
    reminders: ["1hour"]
  }
];

const eventTypeIcons = {
  class: BookOpen,
  assignment: FileText,
  deadline: AlertTriangle,
  quiz: FileText,
  exam: AlertTriangle,
  study: Clock,
};

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-accent text-accent-foreground", 
  high: "bg-destructive text-destructive-foreground",
};

const typeColors = {
  class: "border-l-primary",
  assignment: "border-l-accent",
  deadline: "border-l-destructive",
  quiz: "border-l-secondary",
  exam: "border-l-destructive",
  study: "border-l-muted-foreground",
};

export const WeekView = () => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
  
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const getEventsForDay = (date: Date) => {
    return sampleEvents.filter(event => isSameDay(event.date, date));
  };

  const getUpcomingDeadlines = () => {
    const nextTwoWeeks = addWeeks(today, 2);
    return sampleEvents
      .filter(event => 
        (event.type === "deadline" || event.type === "assignment") &&
        isAfter(event.date, today) &&
        isBefore(event.date, nextTwoWeeks)
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3); // Show top 3 deadlines
  };

  const upcomingDeadlines = getUpcomingDeadlines();

  return (
    <div className="space-y-6">
      {/* Week View */}
      <Card>
        <CardHeader>
          <CardTitle>This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDays.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, today);
              
              return (
                <div key={index} className={`p-3 rounded-lg border ${isToday ? 'bg-primary/5 border-primary' : 'bg-card'}`}>
                  <div className="mb-2">
                    <h3 className={`font-medium text-sm ${isToday ? 'text-primary' : 'text-foreground'}`}>
                      {dayNames[index]}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {dayEvents.length} task{dayEvents.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {dayEvents.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No tasks scheduled</p>
                    ) : (
                      dayEvents.map((event) => {
                        const Icon = eventTypeIcons[event.type];
                        return (
                          <div 
                            key={event.id}
                            className={`p-2 rounded border-l-4 bg-card/50 ${typeColors[event.type]}`}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <Icon className="h-3 w-3" />
                              <span className="text-xs font-medium truncate">{event.title}</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{event.description}</p>
                            <div className="flex items-center justify-between mt-1">
                              <Badge variant="outline" className={`text-xs px-1 py-0 ${priorityColors[event.priority || 'medium']}`}>
                                {event.type}
                              </Badge>
                              {event.time && (
                                <span className="text-xs text-muted-foreground">{event.time}</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between p-3 rounded-lg border bg-destructive/5 border-destructive/20">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-destructive" />
                    <div>
                      <h4 className="font-medium">{deadline.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {deadline.description} • {format(deadline.date, "EEEE 'at' HH:mm")}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-destructive text-destructive-foreground">
                    {deadline.priority || 'High'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};