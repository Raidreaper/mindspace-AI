import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Bot, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AIChatProps {
  onNavigate: (screen: string) => void;
}

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export function AIChat({ onNavigate }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const geminiApiKey = useMemo(() => {
    // Prefer env var if present, fallback to window injected value
    return import.meta.env.VITE_GEMINI_API_KEY || (window as any).__GEMINI_API_KEY__;
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    if (!geminiApiKey) {
      toast({ title: 'Missing API key', description: 'Set VITE_GEMINI_API_KEY in .env or provide it at runtime.', variant: 'destructive' });
      return;
    }

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const history = messages
        .slice(-10)
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');
      const prompt = `${history}${history ? '\n' : ''}User: ${userMessage.content}\nAssistant:`;

      const result = await model.generateContent(prompt);
      const text = result?.response?.text?.() || 'Sorry, I could not generate a response.';
      const assistantMessage: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: text };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      toast({ title: 'AI error', description: err?.message || 'Failed to reach Gemini API.', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-calm">
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
          <Bot className="h-6 w-6" />
          <h1 className="text-xl font-bold">AI Assistant</h1>
        </div>
        <p className="text-blue-100">Ask anything. Your wellness companion is here to help.</p>
      </div>

      <div className="p-6 space-y-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={listRef} className="max-h-[55vh] overflow-y-auto space-y-3 pr-2">
              {messages.length === 0 ? (
                <div className="text-sm text-muted-foreground">Start the conversation by asking a question.</div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex gap-2 ${m.role === 'assistant' ? '' : 'justify-end'}`}>
                    <div className={`flex items-start gap-2 max-w-[80%] ${m.role === 'assistant' ? '' : 'flex-row-reverse'}`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${m.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-wellness text-wellness-foreground'}`}>
                        {m.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                      <div className={`rounded-lg p-3 text-sm ${m.role === 'assistant' ? 'bg-muted' : 'bg-wellness/20'}`}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
              />
              <Button onClick={handleSend} disabled={!input.trim() || isSending}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

