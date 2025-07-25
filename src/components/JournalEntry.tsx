import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: "motivated" | "stressed" | "happy" | "anxious" | "confident" | "overwhelmed" | "focused" | "tired";
  tags: string[];
  date: Date;
}

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

const moodColors = {
  motivated: "bg-green-100 text-green-800 border-green-200",
  stressed: "bg-red-100 text-red-800 border-red-200",
  happy: "bg-yellow-100 text-yellow-800 border-yellow-200",
  anxious: "bg-orange-100 text-orange-800 border-orange-200",
  confident: "bg-blue-100 text-blue-800 border-blue-200",
  overwhelmed: "bg-purple-100 text-purple-800 border-purple-200",
  focused: "bg-teal-100 text-teal-800 border-teal-200",
  tired: "bg-gray-100 text-gray-800 border-gray-200",
};

const moodIcons = {
  motivated: "⭐",
  stressed: "😰",
  happy: "😊",
  anxious: "😟",
  confident: "💪",
  overwhelmed: "🤯",
  focused: "🎯",
  tired: "😴",
};

export const JournalEntryCard = ({ entry, onEdit, onDelete }: JournalEntryCardProps) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold">{entry.title}</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(entry)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(entry.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <Badge className={`${moodColors[entry.mood]} border`}>
            <span className="mr-1">{moodIcons[entry.mood]}</span>
            {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {format(entry.date, "yyyy-MM-dd")}
          </span>
        </div>
        
        <p className="text-muted-foreground mb-3 line-clamp-3">{entry.content}</p>
        
        <div className="flex flex-wrap gap-1">
          {entry.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface JournalFormDialogProps {
  entry?: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<JournalEntry, 'id'> | JournalEntry) => void;
}

export const JournalFormDialog = ({ entry, isOpen, onClose, onSave }: JournalFormDialogProps) => {
  const [formData, setFormData] = useState({
    title: entry?.title || "",
    content: entry?.content || "",
    mood: entry?.mood || "motivated" as JournalEntry["mood"],
    tags: entry?.tags.join(", ") || "",
  });
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const entryData = {
      ...formData,
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0),
      date: entry?.date || new Date(),
    };

    if (entry) {
      onSave({ ...entryData, id: entry.id });
    } else {
      onSave(entryData);
    }
    
    onClose();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      mood: "motivated",
      tags: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {entry ? "Edit Entry" : "New Journal Entry"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Entry title"
            />
          </div>
          <div>
            <Label htmlFor="mood">Mood</Label>
            <Select value={formData.mood} onValueChange={(value) => setFormData({ ...formData, mood: value as JournalEntry["mood"] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="motivated">⭐ Motivated</SelectItem>
                <SelectItem value="stressed">😰 Stressed</SelectItem>
                <SelectItem value="happy">😊 Happy</SelectItem>
                <SelectItem value="anxious">😟 Anxious</SelectItem>
                <SelectItem value="confident">💪 Confident</SelectItem>
                <SelectItem value="overwhelmed">🤯 Overwhelmed</SelectItem>
                <SelectItem value="focused">🎯 Focused</SelectItem>
                <SelectItem value="tired">😴 Tired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write about your academic journey, thoughts, and reflections..."
              rows={6}
            />
          </div>
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="physics, study-group, breakthrough (comma separated)"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {entry ? "Update" : "Save"} Entry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};