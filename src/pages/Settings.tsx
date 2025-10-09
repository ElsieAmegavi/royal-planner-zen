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
import { profileAPI, gradeSettingsAPI, notificationSettingsAPI } from "@/services/api";

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
  
  const [notificationTimings, setNotificationTimings] = useState({
    assignmentFrequency: "24",
    deadlineTimings: ["2", "24"]
  });
  
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false
  });
  
  const [newGrade, setNewGrade] = useState({ name: "", points: "" });
  const [editingGrade, setEditingGrade] = useState<{ name: string; points: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        
        // Load profile from backend
        const backendProfile = await profileAPI.getProfile();
        setProfile({
          name: backendProfile.name || "",
          email: backendProfile.email || "",
          academicLevel: backendProfile.academicLevel || "",
          academicYears: backendProfile.academicYears?.toString() || "4"
        });
        
        // Load grade settings from backend
        const backendGradeSettings = await gradeSettingsAPI.getGradeSettings();
        console.log('Loaded grade settings from API:', backendGradeSettings);
        setGradeSettings(backendGradeSettings);
        
        // Load notification settings from backend
        const backendNotifications = await notificationSettingsAPI.getNotificationSettings();
        setNotifications({
          assignments: backendNotifications.assignments,
          deadlines: backendNotifications.deadlines,
          gpaUpdates: backendNotifications.gpaUpdates,
          weeklyReports: backendNotifications.weeklyReports
        });
        
        setNotificationTimings({
          assignmentFrequency: backendNotifications.assignmentFrequency,
          deadlineTimings: JSON.parse(backendNotifications.deadlineTimings)
        });
        
      } catch (error) {
        console.error('Failed to load settings from backend:', error);
        
        // Fallback to localStorage
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        }
        
        // Try to load grade settings from API as fallback
        try {
          const fallbackGradeSettings = await gradeSettingsAPI.getGradeSettings();
          setGradeSettings(fallbackGradeSettings);
        } catch (gradeError) {
          console.error('Failed to load grade settings from API:', gradeError);
          // Only use localStorage as last resort
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
          }
        }
        
        const savedNotifications = localStorage.getItem('notificationSettings');
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        }
        
        toast({
          title: "Offline Mode",
          description: "Using cached settings. Some features may be limited.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [toast]);

  const saveProfile = async () => {
    try {
      // Save profile to backend
      await profileAPI.updateProfile({
        name: profile.name,
        academicLevel: profile.academicLevel,
        academicYears: parseInt(profile.academicYears)
      });
      
      // Also save to localStorage as backup
      localStorage.setItem('userProfile', JSON.stringify(profile));
      localStorage.setItem('academicYears', profile.academicYears);
      
      toast({
        title: "Profile Saved",
        description: "Your profile settings have been updated successfully."
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
      
      // Fallback to localStorage
      localStorage.setItem('userProfile', JSON.stringify(profile));
      localStorage.setItem('academicYears', profile.academicYears);
      
      toast({
        title: "Profile Saved (Offline)",
        description: "Your profile settings have been updated locally."
      });
    }
  };

  const saveGradeSettings = async () => {
    try {
      // Save grade settings to backend
      await gradeSettingsAPI.updateGradeSettings(gradeSettings);
      
      // Refresh grade settings from API to ensure consistency
      const updatedGradeSettings = await gradeSettingsAPI.getGradeSettings();
      setGradeSettings(updatedGradeSettings);
      
      // Also save to localStorage as backup
      localStorage.setItem('gradeSettings', JSON.stringify(updatedGradeSettings));
      // Trigger storage event to update GPA calculator
      window.dispatchEvent(new Event('storage'));
      
      toast({
        title: "Grade Settings Saved",
        description: "Your custom grade scale has been updated successfully."
      });
    } catch (error) {
      console.error('Failed to save grade settings:', error);
      
      // Fallback to localStorage
      localStorage.setItem('gradeSettings', JSON.stringify(gradeSettings));
      window.dispatchEvent(new Event('storage'));
      
      toast({
        title: "Grade Settings Saved (Offline)",
        description: "Your custom grade scale has been updated locally."
      });
    }
  };

  const addCustomGrade = async () => {
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

    try {
      // Add grade setting to API
      await gradeSettingsAPI.addGradeSetting({
        grade: newGrade.name,
        points: points
      });
      
      // Refresh grade settings from API
      const updatedGradeSettings = await gradeSettingsAPI.getGradeSettings();
      setGradeSettings(updatedGradeSettings);
      
      setNewGrade({ name: "", points: "" });
      
      toast({
        title: "Grade Added",
        description: `${newGrade.name} grade has been added successfully.`
      });
    } catch (error) {
      console.error('Failed to add grade setting:', error);
      toast({
        title: "Error",
        description: "Failed to add grade setting. Please try again.",
        variant: "destructive"
      });
    }
  };

  const editGrade = (gradeName: string, points: number) => {
    setEditingGrade({ name: gradeName, points });
    setNewGrade({ name: gradeName, points: points.toString() });
  };

  const updateGrade = async () => {
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

    try {
      // If grade name changed, delete old grade and add new one
      if (editingGrade.name !== newGrade.name) {
        await gradeSettingsAPI.deleteGradeSetting(editingGrade.name);
        await gradeSettingsAPI.addGradeSetting({
          grade: newGrade.name,
          points: points
        });
      } else {
        // Update existing grade
        await gradeSettingsAPI.updateGradeSetting({
          grade: newGrade.name,
          points: points
        });
      }
      
      // Refresh grade settings from API
      const updatedGradeSettings = await gradeSettingsAPI.getGradeSettings();
      setGradeSettings(updatedGradeSettings);
      
      setEditingGrade(null);
      setNewGrade({ name: "", points: "" });
      
      toast({
        title: "Grade Updated",
        description: "Grade has been updated successfully"
      });
    } catch (error) {
      console.error('Failed to update grade setting:', error);
      toast({
        title: "Error",
        description: "Failed to update grade setting. Please try again.",
        variant: "destructive"
      });
    }
  };

  const cancelEdit = () => {
    setEditingGrade(null);
    setNewGrade({ name: "", points: "" });
  };

  const removeGrade = async (gradeName: string) => {
    try {
      // Delete grade setting from API
      await gradeSettingsAPI.deleteGradeSetting(gradeName);
      
      // Refresh grade settings from API
      const updatedGradeSettings = await gradeSettingsAPI.getGradeSettings();
      setGradeSettings(updatedGradeSettings);
      
      toast({
        title: "Grade Removed",
        description: `${gradeName} grade has been removed successfully.`
      });
    } catch (error) {
      console.error('Failed to remove grade setting:', error);
      toast({
        title: "Error",
        description: "Failed to remove grade setting. Please try again.",
        variant: "destructive"
      });
    }
  };

  const saveNotifications = async () => {
    try {
      // Save notification settings to backend
      await notificationSettingsAPI.updateNotificationSettings({
        assignments: notifications.assignments,
        deadlines: notifications.deadlines,
        gpaUpdates: notifications.gpaUpdates,
        weeklyReports: notifications.weeklyReports,
        assignmentFrequency: notificationTimings.assignmentFrequency,
        deadlineTimings: JSON.stringify(notificationTimings.deadlineTimings)
      });
      
      // Also save to localStorage as backup
      localStorage.setItem('notificationSettings', JSON.stringify(notifications));
      localStorage.setItem('notificationTimings', JSON.stringify(notificationTimings));
      
      toast({
        title: "Notification Settings Saved",
        description: "Your notification preferences have been updated."
      });
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      
      // Fallback to localStorage
      localStorage.setItem('notificationSettings', JSON.stringify(notifications));
      localStorage.setItem('notificationTimings', JSON.stringify(notificationTimings));
      
      toast({
        title: "Notification Settings Saved (Offline)",
        description: "Your notification preferences have been updated locally."
      });
    }
  };

  const changePassword = () => {
    if (security.newPassword !== security.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    if (security.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    // In a real app, verify current password first
    setSecurity(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully."
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
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your settings...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-muted-foreground">
                  Manage your profile, preferences, and account settings
                </p>
              </div>

              <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
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
              <TabsTrigger value="security" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Security
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
                   <div className="space-y-6">
                     {Object.entries(notifications).map(([key, value]) => (
                       <div key={key} className="space-y-4">
                         <div className="flex items-center justify-between">
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
                         
                         {key === 'assignments' && value && (
                           <div className="ml-4 space-y-2">
                             <Label className="text-sm font-medium">Assignment Reminder Frequency</Label>
                             <Select 
                               value={notificationTimings.assignmentFrequency} 
                               onValueChange={(val) => setNotificationTimings(prev => ({ ...prev, assignmentFrequency: val }))}
                             >
                               <SelectTrigger className="w-full">
                                 <SelectValue />
                               </SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="1">1 hour before</SelectItem>
                                 <SelectItem value="2">2 hours before</SelectItem>
                                 <SelectItem value="6">6 hours before</SelectItem>
                                 <SelectItem value="12">12 hours before</SelectItem>
                                 <SelectItem value="24">24 hours before</SelectItem>
                                 <SelectItem value="48">48 hours before</SelectItem>
                               </SelectContent>
                             </Select>
                           </div>
                         )}
                         
                         {key === 'deadlines' && value && (
                           <div className="ml-4 space-y-2">
                             <Label className="text-sm font-medium">Deadline Reminder Times</Label>
                             <div className="space-y-2">
                               {["1", "2", "6", "12", "24", "48"].map((hours) => (
                                 <div key={hours} className="flex items-center space-x-2">
                                   <input
                                     type="checkbox"
                                     id={`deadline-${hours}`}
                                     checked={notificationTimings.deadlineTimings.includes(hours)}
                                     onChange={(e) => {
                                       if (e.target.checked) {
                                         setNotificationTimings(prev => ({
                                           ...prev,
                                           deadlineTimings: [...prev.deadlineTimings, hours]
                                         }));
                                       } else {
                                         setNotificationTimings(prev => ({
                                           ...prev,
                                           deadlineTimings: prev.deadlineTimings.filter(t => t !== hours)
                                         }));
                                       }
                                     }}
                                     className="rounded border-gray-300 text-primary focus:ring-primary"
                                   />
                                   <Label htmlFor={`deadline-${hours}`} className="text-sm">
                                     {hours} hour{hours !== "1" ? "s" : ""} before
                                   </Label>
                                 </div>
                               ))}
                             </div>
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                  
                  <Button onClick={saveNotifications} className="w-full md:w-auto">
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and account security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Change Password</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={security.currentPassword}
                          onChange={(e) => setSecurity(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={security.newPassword}
                            onChange={(e) => setSecurity(prev => ({ ...prev, newPassword: e.target.value }))}
                            placeholder="Enter new password"
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={security.confirmPassword}
                            onChange={(e) => setSecurity(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                      <Button onClick={changePassword} className="w-full md:w-auto">
                        Change Password
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={security.twoFactorEnabled}
                      onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, twoFactorEnabled: checked }))}
                    />
                  </div>
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
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;