import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { MoodTracker } from "@/components/MoodTracker";
import { TaskManager } from "@/components/TaskManager";
import { CrisisSupport } from "@/components/CrisisSupport";
import { AIChat } from "@/components/AIChat";
import { ChatbotWidget } from "@/components/ChatbotWidget";

type Screen = 'dashboard' | 'mood-tracker' | 'tasks' | 'crisis' | 'ai-chat';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);
  
  const navigateToScreen = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  const refreshTasks = () => {
    setTaskRefreshKey(prev => prev + 1);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateToScreen} />;
      case 'mood-tracker':
        return <MoodTracker onNavigate={navigateToScreen} />;
      case 'tasks':
        return <TaskManager key={taskRefreshKey} onNavigate={navigateToScreen} />;
      case 'crisis':
        return <CrisisSupport onNavigate={navigateToScreen} />;
      case 'ai-chat':
        return <AIChat onNavigate={navigateToScreen} />;
      default:
        return <Dashboard onNavigate={navigateToScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}
      <ChatbotWidget onTaskUpdate={refreshTasks} />
    </div>
  );
}