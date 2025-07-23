import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, BellOff, Check, X, Calendar, BookOpen, Target, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: 'assignment' | 'deadline' | 'gpa' | 'reminder' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  urgent?: boolean;
}

const Notifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'deadline',
      title: 'Assignment Due Soon',
      message: 'Mathematics 301 - Calculus III Assignment is due in 2 hours',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      urgent: true
    },
    {
      id: '2',
      type: 'gpa',
      title: 'GPA Updated',
      message: 'Your cumulative GPA has been updated to 3.67 after your recent Chemistry grade',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      type: 'assignment',
      title: 'New Assignment Posted',
      message: 'Physics 201 - Lab Report 3 has been posted. Due date: Next Friday',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      read: true
    },
    {
      id: '4',
      type: 'reminder',
      title: 'Study Session Reminder',
      message: 'Your scheduled study session for Organic Chemistry starts in 30 minutes',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '5',
      type: 'deadline',
      title: 'Registration Deadline',
      message: 'Course registration for next semester closes in 3 days',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      read: true
    },
    {
      id: '6',
      type: 'system',
      title: 'Target Grade Alert',
      message: 'You need to maintain B+ average in remaining courses to achieve your target 3.5 GPA',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '7',
      type: 'assignment',
      title: 'Grade Posted',
      message: 'Your grade for English 102 Essay has been posted: A- (3.7)',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true
    },
    {
      id: '8',
      type: 'reminder',
      title: 'Weekly Report Ready',
      message: 'Your weekly academic progress report is ready to view',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      read: true
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <BookOpen className="h-4 w-4" />;
      case 'deadline':
        return <Clock className="h-4 w-4" />;
      case 'gpa':
        return <Target className="h-4 w-4" />;
      case 'reminder':
        return <Bell className="h-4 w-4" />;
      case 'system':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'deadline':
        return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'gpa':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'reminder':
        return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'system':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    toast({
      title: "All notifications marked as read",
      description: "Your notification list has been updated."
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast({
      title: "Notification deleted",
      description: "The notification has been removed."
    });
  };

  const clearAllNotifications = () => {
    if (confirm("Are you sure you want to clear all notifications? This action cannot be undone.")) {
      setNotifications([]);
      toast({
        title: "All notifications cleared",
        description: "Your notification list is now empty."
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.urgent && !n.read).length;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-accent-light/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Bell className="h-8 w-8 text-primary" />
                  Notifications
                </h1>
                <p className="text-muted-foreground">
                  Stay updated with your academic progress and important deadlines
                </p>
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {unreadCount} unread
                  </Badge>
                )}
                {urgentCount > 0 && (
                  <Badge variant="destructive">
                    {urgentCount} urgent
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <Button onClick={markAllAsRead} variant="outline" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Mark All Read
            </Button>
            <Button onClick={clearAllNotifications} variant="outline" className="flex items-center gap-2">
              <BellOff className="h-4 w-4" />
              Clear All
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                Your latest academic alerts and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No notifications</h3>
                    <p className="text-muted-foreground">You're all caught up! No new notifications at this time.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                          notification.read 
                            ? 'bg-secondary/50 border-border/50' 
                            : 'bg-background border-border shadow-sm'
                        } ${notification.urgent ? 'ring-2 ring-destructive/20' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2 rounded-lg border ${getNotificationColor(notification.type)}`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {notification.title}
                                </h4>
                                {notification.urgent && (
                                  <Badge variant="destructive" className="text-xs">
                                    Urgent
                                  </Badge>
                                )}
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                )}
                              </div>
                              <p className={`text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatTimeAgo(notification.timestamp)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                                className="text-primary hover:text-primary-foreground hover:bg-primary"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;