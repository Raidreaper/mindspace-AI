import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MoodSelector } from "./MoodSelector";
import { useState } from "react";
import { ArrowLeft, Save, Heart, TrendingUp } from "lucide-react";

interface MoodTrackerProps {
  onNavigate: (screen: string) => void;
}

const moodHistory = [
  { date: "Today", mood: 4, notes: "Great therapy session!" },
  { date: "Yesterday", mood: 3, notes: "Stressful work day but managed well" },
  { date: "2 days ago", mood: 5, notes: "Perfect weekend with friends" },
  { date: "3 days ago", mood: 2, notes: "Feeling overwhelmed" },
  { date: "4 days ago", mood: 4, notes: "Good morning meditation" },
  { date: "5 days ago", mood: 3, notes: "" },
  { date: "6 days ago", mood: 4, notes: "Productive day" },
];

const getMoodEmoji = (mood: number) => {
  const emojis = { 1: "😰", 2: "😔", 3: "😐", 4: "😊", 5: "😄" };
  return emojis[mood as keyof typeof emojis] || "😐";
};

const getMoodColor = (mood: number) => {
  const colors = { 1: "mood-terrible", 2: "mood-bad", 3: "mood-okay", 4: "mood-good", 5: "mood-great" };
  return colors[mood as keyof typeof colors] || "mood-okay";
};

export function MoodTracker({ onNavigate }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSaveMood = async () => {
    if (selectedMood === 0) return;
    
    setIsSaving(true);
    // Save to Supabase
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    console.log("Saving mood:", { mood: selectedMood, notes });
    
    // Reset form
    setSelectedMood(0);
    setNotes("");
    setIsSaving(false);
    
    // Show success message
  };

  return (
    <div className="min-h-screen bg-gradient-calm">
      {/* Header */}
      <div className="bg-gradient-wellness p-6 text-wellness-foreground">
        <div className="flex items-center gap-3 mb-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-white/20 text-wellness-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Heart className="h-6 w-6" />
          <h1 className="text-xl font-bold">Mood Tracker</h1>
        </div>
        <p className="text-white/80">How are you feeling right now?</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Mood Logging Form */}
        <Card className="shadow-wellness">
          <CardHeader>
            <CardTitle className="text-lg">Log Your Mood</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Rate your mood (1-5)</label>
              <MoodSelector selectedMood={selectedMood} onMoodSelect={setSelectedMood} />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Notes (optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What's on your mind? How did today go?"
                className="min-h-[100px] resize-none"
              />
            </div>

            <Button 
              onClick={handleSaveMood}
              disabled={selectedMood === 0 || isSaving}
              className="w-full bg-wellness hover:bg-wellness/90"
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Mood Entry
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Mood History */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Mood History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moodHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-${getMoodColor(entry.mood)}/20 flex items-center justify-center`}>
                      <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{entry.date}</div>
                      {entry.notes && (
                        <div className="text-xs text-muted-foreground mt-1 max-w-48 truncate">
                          {entry.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full bg-${getMoodColor(entry.mood)}/20 text-${getMoodColor(entry.mood)}`}>
                    {entry.mood}/5
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}