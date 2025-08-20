import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoodSelector } from "./MoodSelector";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, CheckCircle, AlertTriangle, Brain, LogOut, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [quickMood, setQuickMood] = useState<number>(0);
  const [isLogging, setIsLogging] = useState<boolean>(false);
  const { user, signOut } = useAuth();
  const userName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || "User";
  // Supabase-backed stats with loading state
  const [completedToday, setCompletedToday] = useState<number>(0);
  const [totalToday, setTotalToday] = useState<number>(0);
  const [dayStreak, setDayStreak] = useState<number>(0);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  const startOfLocalDayIso = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };

  const endOfLocalDayIso = (date: Date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  };

  const formatLocalDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const fetchStats = async () => {
    if (!user) return;
    try {
      setStatsLoading(true);
      // Tasks Today (created today)
      const startToday = startOfLocalDayIso(new Date());
      const endToday = endOfLocalDayIso(new Date());
      const { data: tasksToday, error: tasksErr } = await supabase
        .from('tasks')
        .select('id, completed, created_at, updated_at')
        .eq('user_id', user.id)
        .gte('created_at', startToday)
        .lte('created_at', endToday)
        .order('created_at', { ascending: false });
      if (tasksErr) throw tasksErr;
      setTotalToday(tasksToday?.length || 0);
      setCompletedToday((tasksToday || []).filter(t => t.completed).length);

      // Day Streak: any day with mood logged OR any task completed
      const windowDays = 60;
      const startWindow = new Date();
      startWindow.setDate(startWindow.getDate() - (windowDays - 1));
      startWindow.setHours(0, 0, 0, 0);
      const startWindowIso = startWindow.toISOString();

      const [moodsRes, completedTasksRes] = await Promise.all([
        supabase.from('moods').select('created_at').eq('user_id', user.id).gte('created_at', startWindowIso),
        supabase.from('tasks').select('updated_at, completed').eq('user_id', user.id).eq('completed', true).gte('updated_at', startWindowIso),
      ]);
      if (moodsRes.error) throw moodsRes.error;
      if (completedTasksRes.error) throw completedTasksRes.error;

      const activeDays = new Set<string>();
      (moodsRes.data || []).forEach((m: any) => {
        const d = new Date(m.created_at);
        activeDays.add(formatLocalDateKey(d));
      });
      (completedTasksRes.data || []).forEach((t: any) => {
        if (t.completed) {
          const d = new Date(t.updated_at);
          activeDays.add(formatLocalDateKey(d));
        }
      });

      let streak = 0;
      const cursor = new Date();
      cursor.setHours(0, 0, 0, 0);
      // count consecutive days back from today
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const key = formatLocalDateKey(cursor);
        if (activeDays.has(key)) {
          streak += 1;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      }
      setDayStreak(streak);
    } catch (err: any) {
      toast({ title: 'Failed to load stats', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      void fetchStats();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleQuickMoodLog = async () => {
    if (!user || quickMood <= 0 || isLogging) return;
    setIsLogging(true);
    
    try {
      const { error } = await supabase
        .from('moods')
        .insert({
          user_id: user.id,
          mood_score: quickMood,
          notes: null,
        });
      
      if (error) {
        toast({ title: 'Error logging mood', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Mood logged', description: `Saved mood score ${quickMood}/5` });
        setQuickMood(0);
        void fetchStats();
      }
    } catch (err: any) {
      toast({ title: 'Network error', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsLogging(false);
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
                disabled={isLogging}
                className="w-full bg-wellness hover:bg-wellness/90"
              >
                {isLogging ? 'Saving...' : 'Log Mood'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-soft">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-wellness mx-auto mb-2" />
              {statsLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="h-7 w-16" />
                  <div className="text-sm text-muted-foreground">Tasks Today</div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-primary">{completedToday}/{totalToday}</div>
                  <div className="text-sm text-muted-foreground">Tasks Today</div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 text-mood-good mx-auto mb-2" />
              {statsLoading ? (
                <Skeleton className="h-7 w-10 mx-auto" />
              ) : (
                <div className="text-2xl font-bold text-primary">{dayStreak}</div>
              )}
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>

          <div className="col-span-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => fetchStats()} disabled={statsLoading}>
              {statsLoading ? 'Refreshing…' : 'Refresh'}
            </Button>
          </div>
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

          <Button 
            onClick={() => onNavigate('ai-chat')}
            variant="outline"
            className="w-full h-14 text-left justify-start gap-3 bg-card hover:bg-muted border-border shadow-soft hover:shadow-md transition-all duration-300"
          >
            <Bot className="h-6 w-6 text-primary" />
            <div>
              <div className="font-semibold">AI Assistant</div>
              <div className="text-sm text-muted-foreground">Ask wellness questions</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}