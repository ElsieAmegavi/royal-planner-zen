import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { JournalEntryCard, JournalFormDialog, JournalEntry } from "@/components/JournalEntry";
import { Plus, BookOpen } from "lucide-react";
import { journalAPI } from "@/services/api";

// Sample journal entries
const initialEntries: JournalEntry[] = [
  {
    id: "1",
    title: "Great Progress in Physics",
    content: "Finally understood quantum mechanics concepts that were confusing me for weeks. The study group really helped, and I feel more confident about the upcoming exam.",
    mood: "motivated",
    tags: ["physics", "study-group", "breakthrough"],
    date: new Date(2024, 0, 15)
  },
  {
    id: "2",
    title: "Struggling with Time Management",
    content: "Had three assignments due this week and felt overwhelmed. Need to work on better planning and starting assignments earlier. Maybe I should use a better scheduling system.",
    mood: "stressed",
    tags: ["time-management", "assignments", "planning"],
    date: new Date(2024, 0, 12)
  }
];

const Journal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  

  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        const response = await journalAPI.getEntries();
        setEntries(response);
      } catch (error) {
        console.error('Failed to load journal entries from backend:', error);
        
        // Fallback to localStorage
        const savedEntries = localStorage.getItem('journalEntries');
        if (savedEntries) {
          const parsed = JSON.parse(savedEntries).map((entry: any) => ({
            ...entry,
            date: new Date(entry.date)
          }));
          setEntries(parsed);
        } else {
          setEntries(initialEntries);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const handleSaveEntry = async (entryData: Omit<JournalEntry, 'id'> | JournalEntry) => {
    try {
      if ('id' in entryData) {
        // Editing existing entry
        await journalAPI.updateEntry(parseInt(entryData.id), {
          title: entryData.title,
          content: entryData.content,
          mood: entryData.mood,
          tags: entryData.tags,
          date: entryData.date.toISOString()
        });
        setEntries(entries.map(entry => 
          entry.id === entryData.id ? entryData : entry
        ));
      } else {
        // Creating new entry
        const response = await journalAPI.createEntry({
          title: entryData.title,
          content: entryData.content,
          mood: entryData.mood,
          tags: entryData.tags,
          date: entryData.date.toISOString()
        });
        
        const newEntry: JournalEntry = {
          ...entryData,
          id: response.id.toString()
        };
        setEntries([newEntry, ...entries]);
      }
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      
      // Fallback to localStorage
      if ('id' in entryData) {
        setEntries(entries.map(entry => 
          entry.id === entryData.id ? entryData : entry
        ));
      } else {
        const newEntry: JournalEntry = {
          ...entryData,
          id: Date.now().toString()
        };
        setEntries([newEntry, ...entries]);
      }
      
      // Save to localStorage as backup
      localStorage.setItem('journalEntries', JSON.stringify(entries));
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsDialogOpen(true);
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await journalAPI.deleteEntry(parseInt(id));
      setEntries(entries.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Failed to delete journal entry:', error);
      
      // Fallback to localStorage
      setEntries(entries.filter(entry => entry.id !== id));
      localStorage.setItem('journalEntries', JSON.stringify(entries.filter(entry => entry.id !== id)));
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEntry(null);
  };

  // Calculate mood insights
  const moodCounts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalEntries = entries.length;
  const thisMonthEntries = entries.filter(entry => {
    console.log(entry.date);
    const entryMonth = new Date(entry.date).getMonth();
    const currentMonth = new Date().getMonth();
    return entryMonth === currentMonth;
  }).length;

  const avgPerWeek = totalEntries > 0 ? (totalEntries / 4).toFixed(1) : "0";

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-accent-light/20">
        {/* Header Section */}
        <div className="bg-purple-600 text-white p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8" />
                <h1 className="text-2xl sm:text-3xl font-bold">Reflection Journal</h1>
              </div>
              <p className="text-purple-100 text-sm sm:text-base">
                Track your academic journey, moods, and personal growth
              </p>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)} 
              className="bg-white text-purple-600 hover:bg-purple-50 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Main Content - Journal Entries */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Your Entries</h2>
                <div>
                  {entries.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">No entries yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Start your academic reflection journey by creating your first entry
                        </p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Entry
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    entries.map((entry) => (
                      <JournalEntryCard
                        key={entry.id}
                        entry={entry}
                        onEdit={handleEditEntry}
                        onDelete={handleDeleteEntry}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Mood Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Mood Insights</CardTitle>
                  <p className="text-sm text-muted-foreground">Your emotional journey this month</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(moodCounts).slice(0, 2).map(([mood, count]) => (
                    <div key={mood} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                        <span className="capitalize">{mood}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count}</span>
                        <div className="w-16 h-2 bg-muted rounded-full">
                          <div 
                            className="h-full bg-purple-500 rounded-full" 
                            style={{ width: `${(count / totalEntries) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Writing Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Writing Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Entries:</span>
                    <span className="font-semibold">{totalEntries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">This Month:</span>
                    <span className="font-semibold">{thisMonthEntries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg per Week:</span>
                    <span className="font-semibold">{avgPerWeek}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <JournalFormDialog
          entry={editingEntry}
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onSave={handleSaveEntry}
        />
      </div>
    </Layout>
  );
};

export default Journal;