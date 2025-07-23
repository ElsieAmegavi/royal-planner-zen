import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, GraduationCap, Bell, Palette, Download, RotateCcw, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    academicLevel: "",
    academicYears: "4"
  });
  
  const [gradeSettings, setGradeSettings] = useState<{ [key: string]: number }>({});
  const [notifications, setNotifications] = useState({
    assignments: true,
    deadlines: true,
    gpaUpdates: true,
    weeklyReports: false
  });
  
  const [newGrade, setNewGrade] = useState({ name: "", points: "" });
  const [editingGrade, setEditingGrade] = useState<{ name: string; points: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved settings
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    
    const savedGrades = localStorage.getItem('gradeSettings');
    if (savedGrades) {
      setGradeSettings(JSON.parse(savedGrades));
    } else {
      // Default grade settings
      const defaultGrades = {
        "A+": 4.0, "A": 4.0, "A-": 3.7,
        "B+": 3.3, "B": 3.0, "B-": 2.7,
        "C+": 2.3, "C": 2.0, "C-": 1.7,
        "D+": 1.3, "D": 1.0, "F": 0.0
      };
      setGradeSettings(defaultGrades);
      localStorage.setItem('gradeSettings', JSON.stringify(defaultGrades));
    }
    
    const savedNotifications = localStorage.getItem('notificationSettings');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  const saveProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    localStorage.setItem('academicYears', profile.academicYears);
    toast({
      title: "Profile Saved",
      description: "Your profile settings have been updated successfully."
    });
  };

  const saveGradeSettings = () => {
    localStorage.setItem('gradeSettings', JSON.stringify(gradeSettings));
    // Trigger storage event to update GPA calculator
    window.dispatchEvent(new Event('storage'));
    toast({
      title: "Grade Settings Saved",
      description: "Your custom grade scale has been updated."
    });
  };

  const addCustomGrade = () => {
    if (!newGrade.name || !newGrade.points) {
      toast({
        title: "Missing Information",
        description: "Please enter both grade name and points",
        variant: "destructive"
      });
      return;
    }
    
    const points = parseFloat(newGrade.points);
    if (isNaN(points) || points < 0 || points > 4) {
      toast({
        title: "Invalid Points",
        description: "Points must be a number between 0 and 4",
        variant: "destructive"
      });
      return;
    }

    setGradeSettings(prev => ({
      ...prev,
      [newGrade.name]: points
    }));
    setNewGrade({ name: "", points: "" });
  };

  const editGrade = (gradeName: string, points: number) => {
    setEditingGrade({ name: gradeName, points });
    setNewGrade({ name: gradeName, points: points.toString() });
  };

  const updateGrade = () => {
    if (!editingGrade || !newGrade.name || !newGrade.points) return;
    
    const points = parseFloat(newGrade.points);
    if (isNaN(points) || points < 0 || points > 4) {
      toast({
        title: "Invalid Points",
        description: "Points must be a number between 0 and 4",
        variant: "destructive"
      });
      return;
    }

    setGradeSettings(prev => {
      const updated = { ...prev };
      if (editingGrade.name !== newGrade.name) {
        delete updated[editingGrade.name];
      }
      updated[newGrade.name] = points;
      return updated;
    });
    
    setEditingGrade(null);
    setNewGrade({ name: "", points: "" });
    toast({
      title: "Grade Updated",
      description: "Grade has been updated successfully"
    });
  };

  const cancelEdit = () => {
    setEditingGrade(null);
    setNewGrade({ name: "", points: "" });
  };

  const removeGrade = (gradeName: string) => {
    setGradeSettings(prev => {
      const updated = { ...prev };
      delete updated[gradeName];
      return updated;
    });
  };

  const saveNotifications = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notifications));
    toast({
      title: "Notification Settings Saved",
      description: "Your notification preferences have been updated."
    });
  };

  const resetAllData = () => {
    if (confirm("Are you sure you want to reset all your data? This action cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const exportData = () => {
    const data = {
      profile: localStorage.getItem('userProfile'),
      semesters: localStorage.getItem('semesterData'),
      grades: localStorage.getItem('gradeSettings'),
      notifications: localStorage.getItem('notificationSettings')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'royal-planner-data.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Your data has been exported successfully."
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-accent-light/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your profile, preferences, and account settings
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="academic" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Academic
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and academic details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="academicLevel">Academic Level</Label>
                      <Select value={profile.academicLevel} onValueChange={(value) => setProfile(prev => ({ ...prev, academicLevel: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">100 Level</SelectItem>
                          <SelectItem value="200">200 Level</SelectItem>
                          <SelectItem value="300">300 Level</SelectItem>
                          <SelectItem value="400">400 Level</SelectItem>
                          <SelectItem value="500">500 Level</SelectItem>
                          <SelectItem value="600">600 Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="academicYears">Program Duration</Label>
                      <Select value={profile.academicYears} onValueChange={(value) => setProfile(prev => ({ ...prev, academicYears: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4">4 Years</SelectItem>
                          <SelectItem value="5">5 Years</SelectItem>
                          <SelectItem value="6">6 Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button onClick={saveProfile} className="w-full md:w-auto">
                    Save Profile
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Grade Scale Settings</CardTitle>
                  <CardDescription>
                    Customize your institution's grading scale and point values
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Object.entries(gradeSettings).map(([grade, points]) => (
                      <div key={grade} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div>
                          <Badge variant="outline" className="mb-1">{grade}</Badge>
                          <p className="text-sm font-medium">{points.toFixed(1)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editGrade(grade, points)}
                          className="text-primary hover:text-primary-foreground hover:bg-primary mr-1"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeGrade(grade)}
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">
                      {editingGrade ? "Edit Grade" : "Add Custom Grade"}
                    </h4>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Grade (e.g., A+)"
                        value={newGrade.name}
                        onChange={(e) => setNewGrade(prev => ({ ...prev, name: e.target.value }))}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Points (0-4)"
                        type="number"
                        min="0"
                        max="4"
                        step="0.1"
                        value={newGrade.points}
                        onChange={(e) => setNewGrade(prev => ({ ...prev, points: e.target.value }))}
                        className="w-32"
                      />
                      {editingGrade ? (
                        <>
                          <Button onClick={updateGrade}>
                            Update
                          </Button>
                          <Button onClick={cancelEdit} variant="outline">
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button onClick={addCustomGrade}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <Button onClick={saveGradeSettings} className="w-full md:w-auto">
                    Save Grade Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Control when and how you receive notifications from Royal Planner
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {key === 'assignments' && 'Get notified about upcoming assignments'}
                            {key === 'deadlines' && 'Receive deadline reminders'}
                            {key === 'gpaUpdates' && 'Get updates when your GPA changes'}
                            {key === 'weeklyReports' && 'Receive weekly academic progress reports'}
                          </p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <Button onClick={saveNotifications} className="w-full md:w-auto">
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>
                    Export your data or reset your account settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export Data
                    </Button>
                    <Button onClick={resetAllData} variant="destructive" className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Reset All Data
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Export your data to backup your academic records, or reset all data to start fresh.
                    Resetting data cannot be undone.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;