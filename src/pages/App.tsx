import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { MoodTracker } from "@/components/MoodTracker";
import { TaskManager } from "@/components/TaskManager";
import { CrisisSupport } from "@/components/CrisisSupport";

type Screen = 'dashboard' | 'mood-tracker' | 'tasks' | 'crisis';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  
  const navigateToScreen = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateToScreen} />;
      case 'mood-tracker':
        return <MoodTracker onNavigate={navigateToScreen} />;
      case 'tasks':
        return <TaskManager onNavigate={navigateToScreen} />;
      case 'crisis':
        return <CrisisSupport onNavigate={navigateToScreen} />;
      default:
        return <Dashboard onNavigate={navigateToScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}
    </div>
  );
}