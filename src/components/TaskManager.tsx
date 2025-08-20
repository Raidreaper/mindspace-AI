import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { ArrowLeft, Plus, CheckCircle, Circle, Trash2 } from "lucide-react";

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
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Morning meditation", completed: true, createdAt: "2024-01-20" },
    { id: "2", title: "Drink 8 glasses of water", completed: false, createdAt: "2024-01-20" },
    { id: "3", title: "Call a friend", completed: true, createdAt: "2024-01-20" },
    { id: "4", title: "Take evening walk", completed: false, createdAt: "2024-01-20" },
    { id: "5", title: "Practice gratitude journaling", completed: false, createdAt: "2024-01-20" },
    { id: "6", title: "Read for 30 minutes", completed: true, createdAt: "2024-01-20" },
    { id: "7", title: "Prepare healthy lunch", completed: false, createdAt: "2024-01-20" },
  ]);

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.trim(),
        completed: false,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTasks([task, ...tasks]);
      setNewTask("");
      // Save to Supabase
      console.log("Adding task:", task);
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
    // Update in Supabase
    console.log("Toggling task:", taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    // Delete from Supabase
    console.log("Deleting task:", taskId);
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
                disabled={!newTask.trim()}
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
              {tasks.length === 0 ? (
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