import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { JournalEntryCard, JournalFormDialog, JournalEntry } from "@/components/JournalEntry";
import { Plus, BookOpen } from "lucide-react";

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
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const handleSaveEntry = (entryData: Omit<JournalEntry, 'id'> | JournalEntry) => {
    if ('id' in entryData) {
      // Editing existing entry
      setEntries(entries.map(entry => 
        entry.id === entryData.id ? entryData : entry
      ));
    } else {
      // Creating new entry
      const newEntry: JournalEntry = {
        ...entryData,
        id: Date.now().toString()
      };
      setEntries([newEntry, ...entries]);
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsDialogOpen(true);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
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
    const entryMonth = entry.date.getMonth();
    const currentMonth = new Date().getMonth();
    return entryMonth === currentMonth;
  }).length;

  const avgPerWeek = totalEntries > 0 ? (totalEntries / 4).toFixed(1) : "0";

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-accent-light/20">
        {/* Header Section */}
        <div className="bg-purple-600 text-white p-6 mb-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Reflection Journal</h1>
              </div>
              <p className="text-purple-100">
                Track your academic journey, moods, and personal growth
              </p>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)} 
              className="bg-white text-purple-600 hover:bg-purple-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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