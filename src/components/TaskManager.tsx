import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, CheckCircle, Circle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

interface TaskManagerProps {
  onNavigate: (screen: string) => void;
}

export function TaskManager({ onNavigate }: TaskManagerProps) {
  const [newTask, setNewTask] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const { user } = useAuth();

  const completedCount = useMemo(() => tasks.filter(task => task.completed).length, [tasks]);
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const loadTasks = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, completed, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        toast({ title: 'Error loading tasks', description: error.message, variant: 'destructive' });
      } else {
        const mapped: Task[] = (data || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          completed: t.completed,
          createdAt: t.created_at,
        }));
        setTasks(mapped);
      }
    } catch (err: any) {
      toast({ title: 'Network error', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleAddTask = async () => {
    if (!user || !newTask.trim() || isAdding) return;
    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ user_id: user.id, title: newTask.trim(), completed: false })
        .select('id, title, completed, created_at')
        .single();
      if (error) {
        toast({ title: 'Error adding task', description: error.message, variant: 'destructive' });
      } else if (data) {
        setTasks((prev) => [{
          id: data.id,
          title: data.title,
          completed: data.completed,
          createdAt: data.created_at,
        }, ...prev]);
      setNewTask("");
      }
    } catch (err: any) {
      toast({ title: 'Network error', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const current = tasks.find(t => t.id === taskId);
    if (!current) return;
    const nextCompleted = !current.completed;
    setTasks(tasks.map(task => task.id === taskId ? { ...task, completed: nextCompleted } : task));
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: nextCompleted })
        .eq('id', taskId);
      if (error) {
        toast({ title: 'Error updating task', description: error.message, variant: 'destructive' });
        // revert on error
        setTasks(tasks.map(task => task.id === taskId ? { ...task, completed: current.completed } : task));
      }
    } catch (err: any) {
      toast({ title: 'Network error', description: err?.message || 'Please try again.', variant: 'destructive' });
      setTasks(tasks.map(task => task.id === taskId ? { ...task, completed: current.completed } : task));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const prev = tasks;
    setTasks(prev.filter(task => task.id !== taskId));
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      if (error) {
        toast({ title: 'Error deleting task', description: error.message, variant: 'destructive' });
        setTasks(prev); // revert
      }
    } catch (err: any) {
      toast({ title: 'Network error', description: err?.message || 'Please try again.', variant: 'destructive' });
      setTasks(prev);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-calm">
      {/* Header */}
      <div className="bg-gradient-primary p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-white/20 text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CheckCircle className="h-6 w-6" />
          <h1 className="text-xl font-bold">Tasks & Goals</h1>
        </div>
        <p className="text-blue-100">Stay on track with your daily goals</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Progress Overview */}
        <Card className="shadow-soft bg-gradient-wellness text-wellness-foreground">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold mb-2">{completedCount}/{totalCount}</div>
            <div className="text-lg mb-3">Tasks Completed Today</div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="text-sm mt-2 opacity-90">{completionPercentage}% Complete</div>
          </CardContent>
        </Card>

        {/* Add New Task */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Add New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What would you like to accomplish?"
                className="flex-1"
              />
              <Button 
                onClick={handleAddTask}
                disabled={!newTask.trim() || isAdding}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Task List */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Circle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No tasks yet. Add one above to get started!</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                      task.completed 
                        ? 'bg-wellness/10 border-wellness/30' 
                        : 'bg-card border-border hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.id)}
                      className="data-[state=checked]:bg-wellness data-[state=checked]:border-wellness"
                    />
                    <span 
                      className={`flex-1 transition-all duration-200 ${
                        task.completed 
                          ? 'line-through text-muted-foreground' 
                          : 'text-foreground'
                      }`}
                    >
                      {task.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}