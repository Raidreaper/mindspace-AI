import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type TaskRow = { id: string; title: string; completed: boolean; created_at: string };

interface ChatbotWidgetProps {
  onTaskUpdate?: () => void;
}

export function ChatbotWidget({ onTaskUpdate }: ChatbotWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();

  const apiKey = useMemo(() => {
    // Only use environment variable - no fallbacks
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('API Key loaded:', key ? 'Yes' : 'No');
    return key;
  }, []);

  useEffect(() => {
    if (open) {
      void loadTasks();
      if (messages.length === 0) {
                setMessages([
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Hi! I am your wellness assistant. 💡 Click "Get Task Ideas" above to see AI-suggested tasks you can approve, or ask me anything! You can also:\n• add task: [title]\n• complete task: [title]\n• delete task: [title]\n• list tasks',
          },
        ]);
      }
    }
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, open]);

  const loadTasks = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, completed, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) {
        toast({ title: 'Error loading tasks', description: error.message, variant: 'destructive' });
      } else {
        console.log('Tasks loaded:', data?.length || 0, 'tasks');
        setTasks(data || []);
      }
    } catch (err: any) {
      toast({ title: 'Network error', description: err?.message || 'Please try again.', variant: 'destructive' });
    }
  };

  const addTask = async (title: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ user_id: user.id, title, completed: false })
        .select('id, title, completed, created_at')
        .single();
      if (error) {
        toast({ title: 'Error adding task', description: error.message, variant: 'destructive' });
      } else if (data) {
        setTasks((prev) => [data, ...prev]);
        onTaskUpdate?.(); // Notify parent component to refresh tasks
        toast({ title: 'Task added', description: `"${title}" has been added.` });
      }
    } catch (err: any) {
      toast({ title: 'Network error', description: err?.message || 'Please try again.', variant: 'destructive' });
    }
  };

  const completeTask = async (taskId: string) => {
    if (!user) return;
    console.log('Completing task:', taskId);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: true })
        .eq('id', taskId)
        .eq('user_id', user.id);
      if (error) {
        console.error('Error completing task:', error);
        toast({ title: 'Error completing task', description: error.message, variant: 'destructive' });
      } else {
        console.log('Task completed successfully');
        setTasks((prev) => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
        onTaskUpdate?.(); // Notify parent component to refresh tasks
        toast({ title: 'Task completed', description: 'Task marked as done!' });
      }
    } catch (err: any) {
      console.error('Exception completing task:', err);
      toast({ title: 'Network error', description: err?.message || 'Please try again.', variant: 'destructive' });
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    console.log('Deleting task:', taskId);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);
      if (error) {
        console.error('Error deleting task:', error);
        toast({ title: 'Error deleting task', description: error.message, variant: 'destructive' });
      } else {
        console.log('Task deleted successfully');
        setTasks((prev) => prev.filter(t => t.id !== taskId));
        onTaskUpdate?.(); // Notify parent component to refresh tasks
        toast({ title: 'Task deleted', description: 'Task removed successfully.' });
      }
    } catch (err: any) {
      console.error('Exception deleting task:', err);
      toast({ title: 'Network error', description: err?.message || 'Please try again.', variant: 'destructive' });
    }
  };

  const handleCommand = async (text: string): Promise<boolean> => {
    const addMatch = text.match(/^\s*(add|create)\s*(task\s*:\s*|:\s*)?(.*)$/i);
    if (addMatch && addMatch[3]) {
      const title = addMatch[3].trim();
      if (title) {
        await addTask(title);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: `Added task: ${title}` },
        ]);
        return true;
      }
    }

    const listMatch = text.match(/^\s*(list|show)\s*(tasks)?\s*$/i);
    if (listMatch) {
      const lines = tasks.map((t, i) => `${i + 1}. ${t.title} ${t.completed ? '(done)' : ''}`).join('\n');
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: lines || 'No tasks yet.' },
      ]);
      return true;
    }

    const completeMatch = text.match(/^\s*(complete|done|finish)\s*(task\s*:\s*|:\s*)?(.*)$/i);
    if (completeMatch && completeMatch[3]) {
      const title = completeMatch[3].trim();
      console.log('Complete command matched:', title);
      console.log('Available tasks:', tasks);
      const task = tasks.find(t => t.title.toLowerCase().includes(title.toLowerCase()) && !t.completed);
      console.log('Found task to complete:', task);
      if (task) {
        await completeTask(task.id);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: `Marked task as complete: ${task.title}` },
        ]);
        return true;
      } else {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: `Task not found or already completed: ${title}` },
        ]);
        return true;
      }
    }

    const deleteMatch = text.match(/^\s*(delete|remove)\s*(task\s*:\s*|:\s*)?(.*)$/i);
    if (deleteMatch && deleteMatch[3]) {
      const title = deleteMatch[3].trim();
      const task = tasks.find(t => t.title.toLowerCase().includes(title.toLowerCase()));
      if (task) {
        await deleteTask(task.id);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: `Deleted task: ${task.title}` },
        ]);
        return true;
      } else {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: `Task not found: ${title}` },
        ]);
        return true;
      }
    }

    return false;
  };

  const handleSuggest = async () => {
    console.log('HandleSuggest called, API key:', apiKey ? 'Present' : 'Missing');
    if (!apiKey) {
      toast({ title: 'Missing API key', description: 'Please enter your Gemini API key below.', variant: 'destructive' });
      return;
    }
    try {
      setSuggestions([]);
      // Standard import - rely on Vite config for cache busting
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      // Debug log to verify model name
      console.log('🔍 Chatbot - Using model:', 'gemini-2.5-flash');
      console.log('🔍 Chatbot - API Key:', apiKey ? 'Present' : 'MISSING');
      const historySummary = tasks.slice(0, 10).map((t) => `- ${t.title} ${t.completed ? '(done)' : ''}`).join('\n');
      const prompt = `You are a wellness coach. Based on this task history, propose 3 short, actionable exercise tasks (5-7 words each), return as plain lines without numbering.\nTasks so far:\n${historySummary}`;
      const result = await model.generateContent(prompt);
      const text = result?.response?.text?.() || '';
      const lines = text.split(/\r?\n/).map((l) => l.replace(/^[-*\d.\s]+/, '').trim()).filter(Boolean);
      setSuggestions(lines.slice(0, 5));
    } catch (err: any) {
      toast({ title: 'AI error', description: err?.message || 'Failed to fetch suggestions.', variant: 'destructive' });
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Commands first
    if (await handleCommand(trimmed)) return;

    if (!apiKey) {
      toast({ title: 'Missing API key', description: 'Please enter your Gemini API key below.', variant: 'destructive' });
      return;
    }

    setIsSending(true);
    try {
      // Standard import - rely on Vite config for cache busting
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      // Debug log to verify model name
      console.log('🔍 Chatbot - Using model:', 'gemini-2.5-flash');
      console.log('🔍 Chatbot - API Key:', apiKey ? 'Present' : 'MISSING');
      const tasksContext = tasks.slice(0, 10).map((t, i) => `${i + 1}. ${t.title} ${t.completed ? '(done)' : ''}`).join('\n');
      const context = `You are a supportive mental wellness assistant. The user has these recent tasks:\n${tasksContext}\nBe concise and kind. If the user asks to add a task, prefer the pattern: add task: <title>`;
      const history = messages
        .slice(-10)
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');
      const prompt = `${context}\n\n${history}${history ? '\n' : ''}User: ${userMsg.content}\nAssistant:`;
      const result = await model.generateContent(prompt);
      const text = result?.response?.text?.() || 'Sorry, I could not generate a response.';
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: text }]);
    } catch (err: any) {
      toast({ title: 'AI error', description: err?.message || 'Failed to reach Gemini.', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full p-0 shadow-glow bg-primary hover:bg-primary/90 z-50"
        aria-label="Open AI assistant"
      >
        <Bot className="h-6 w-6 text-primary-foreground" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> AI Wellness Assistant</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  Chat with your AI assistant to manage tasks and get wellness suggestions.
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSuggest}>💡 Get Task Ideas</Button>
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)} aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="p-4">
            {suggestions.length > 0 && (
              <div className="mb-3 space-y-2">
                <div className="text-sm font-medium text-muted-foreground">AI Task Suggestions - Click "Add" to approve:</div>
                {suggestions.map((s, idx) => (
                  <div key={`${s}-${idx}`} className="flex items-center justify-between gap-2 rounded-md border p-2 bg-muted/50">
                    <div className="text-sm">{s}</div>
                    <Button size="sm" onClick={() => addTask(s)}>Add</Button>
                  </div>
                ))}
              </div>
            )}

            <div ref={listRef} className="h-80 overflow-y-auto space-y-3 pr-1">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'assistant' ? '' : 'justify-end'}`}>
                  <div className={`rounded-lg p-3 text-sm max-w-[85%] ${m.role === 'assistant' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask, or try: add task: evening walk"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleSend(); } }}
              />
              <Button onClick={handleSend} disabled={!input.trim() || isSending}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

