import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { ArrowLeft, Phone, Heart, Waves, Shield, Clock } from "lucide-react";

interface CrisisProps {
  onNavigate: (screen: string) => void;
}

export function CrisisSupport({ onNavigate }: CrisisProps) {
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState<number>(4);
  const [isBreathing, setIsBreathing] = useState<boolean>(false);

  const emergencyContacts = [
    {
      name: "National Suicide Prevention Lifeline",
      number: "988",
      description: "24/7 free and confidential support"
    },
    {
      name: "Crisis Text Line",
      number: "Text HOME to 741741",
      description: "Free, 24/7 text support"
    },
    {
      name: "SAMHSA National Helpline",
      number: "1-800-662-4357",
      description: "Mental health and substance abuse"
    },
    {
      name: "Emergency Services",
      number: "911",
      description: "For immediate emergency assistance"
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isBreathing) {
      interval = setInterval(() => {
        setBreathingCount(prev => {
          if (prev <= 1) {
            setBreathingPhase(current => {
              if (current === 'inhale') return 'hold';
              if (current === 'hold') return 'exhale';
              return 'inhale';
            });
            return breathingPhase === 'hold' ? 2 : 4; // Hold for 2, others for 4
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isBreathing, breathingPhase]);

  const handleBreathingToggle = () => {
    setIsBreathing(!isBreathing);
    if (!isBreathing) {
      setBreathingPhase('inhale');
      setBreathingCount(4);
    }
  };

  const getPhaseInstruction = () => {
    switch (breathingPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
    }
  };

  const getPhaseColor = () => {
    switch (breathingPhase) {
      case 'inhale': return 'bg-wellness';
      case 'hold': return 'bg-primary';
      case 'exhale': return 'bg-accent';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-calm">
      {/* Header */}
      <div className="bg-crisis p-6 text-crisis-foreground">
        <div className="flex items-center gap-3 mb-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-white/20 text-crisis-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Shield className="h-6 w-6" />
          <h1 className="text-xl font-bold">Crisis Support</h1>
        </div>
        <p className="text-red-100">You are not alone. Help is available.</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Safety Message */}
        <Card className="shadow-soft border-crisis/20 bg-crisis/5">
          <CardContent className="p-6 text-center">
            <Heart className="h-12 w-12 text-crisis mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">You Matter</h2>
            <p className="text-muted-foreground mb-4">
              If you're having thoughts of self-harm or suicide, please reach out for help immediately. 
              You deserve support and care.
            </p>
            <Button 
              onClick={() => onNavigate('dashboard')}
              className="bg-wellness hover:bg-wellness/90"
            >
              I'm Safe Now
            </Button>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5 text-crisis" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{contact.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{contact.description}</p>
                    <p className="font-mono text-lg font-bold text-crisis">{contact.number}</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-crisis hover:bg-crisis/90"
                    onClick={() => window.open(`tel:${contact.number.replace(/\D/g, '')}`, '_self')}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Breathing Exercise */}
        <Card className="shadow-wellness">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Waves className="h-5 w-5 text-wellness" />
              Guided Breathing Exercise
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">
              Take a moment to breathe and ground yourself. Follow the circle.
            </p>
            
            <div className="relative">
              <div 
                className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center text-white font-bold transition-all duration-1000 ${getPhaseColor()}`}
                style={{
                  transform: isBreathing ? 
                    `scale(${breathingPhase === 'inhale' ? 1.2 : breathingPhase === 'hold' ? 1.2 : 0.8})` : 
                    'scale(1)'
                }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold">{breathingCount}</div>
                  <div className="text-sm">{getPhaseInstruction()}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleBreathingToggle}
                className={`w-full ${isBreathing ? 'bg-crisis hover:bg-crisis/90' : 'bg-wellness hover:bg-wellness/90'}`}
              >
                {isBreathing ? 'Stop Exercise' : 'Start Breathing Exercise'}
              </Button>
              
              <div className="text-xs text-muted-foreground">
                4 seconds in • 2 seconds hold • 4 seconds out
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grounding Techniques */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Quick Grounding Techniques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <h4 className="font-semibold text-sm mb-1">5-4-3-2-1 Technique</h4>
                <p className="text-xs text-muted-foreground">
                  Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50">
                <h4 className="font-semibold text-sm mb-1">Body Scan</h4>
                <p className="text-xs text-muted-foreground">
                  Starting from your toes, slowly notice each part of your body and release tension.
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50">
                <h4 className="font-semibold text-sm mb-1">Safe Place Visualization</h4>
                <p className="text-xs text-muted-foreground">
                  Picture a place where you feel completely safe and calm. Focus on the details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}