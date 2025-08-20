import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoodSelector } from "./MoodSelector";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, CheckCircle, AlertTriangle, Brain, LogOut } from "lucide-react";

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [quickMood, setQuickMood] = useState<number>(0);
  const { user, signOut } = useAuth();
  const userName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || "User";
  const completedTasks = 3;
  const totalTasks = 7;

  const handleQuickMoodLog = () => {
    if (quickMood > 0) {
      // Save to Supabase
      console.log("Logging mood:", quickMood);
      // Show success toast
    }
  };

  return (
    <div className="min-h-screen bg-gradient-calm">
      {/* Header */}
      <div className="bg-gradient-primary p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8" />
            <h1 className="text-2xl font-bold">MindSpace AI</h1>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={signOut}
            className="flex items-center gap-2 text-white border-white/20 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
        <p className="text-blue-100">Welcome back, {userName}! 🌟</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Mood Log */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-wellness" />
              How are you feeling today?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MoodSelector selectedMood={quickMood} onMoodSelect={setQuickMood} />
            {quickMood > 0 && (
              <Button 
                onClick={handleQuickMoodLog}
                className="w-full bg-wellness hover:bg-wellness/90"
              >
                Log Mood
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-soft">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-wellness mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{completedTasks}/{totalTasks}</div>
              <div className="text-sm text-muted-foreground">Tasks Today</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 text-mood-good mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">7</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => onNavigate('mood-tracker')}
            variant="outline"
            className="w-full h-14 text-left justify-start gap-3 bg-gradient-wellness text-wellness-foreground border-0 shadow-wellness hover:shadow-lg transition-all duration-300"
          >
            <Heart className="h-6 w-6" />
            <div>
              <div className="font-semibold">Mood Tracker</div>
              <div className="text-sm opacity-80">Log detailed mood entries</div>
            </div>
          </Button>

          <Button 
            onClick={() => onNavigate('tasks')}
            variant="outline"
            className="w-full h-14 text-left justify-start gap-3 bg-card hover:bg-muted border-border shadow-soft hover:shadow-md transition-all duration-300"
          >
            <CheckCircle className="h-6 w-6 text-primary" />
            <div>
              <div className="font-semibold">Tasks & Goals</div>
              <div className="text-sm text-muted-foreground">Manage your daily tasks</div>
            </div>
          </Button>

          <Button 
            onClick={() => onNavigate('crisis')}
            className="w-full h-14 text-left justify-start gap-3 bg-crisis hover:bg-crisis/90 text-crisis-foreground shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <AlertTriangle className="h-6 w-6" />
            <div>
              <div className="font-semibold">Crisis Support</div>
              <div className="text-sm opacity-90">Get immediate help</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}