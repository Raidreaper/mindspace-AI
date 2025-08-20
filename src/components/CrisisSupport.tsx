import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { ArrowLeft, Phone, Heart, Waves, Shield, Clock, AlertTriangle, Target, Zap, Eye, Hand, Ear, Coffee } from "lucide-react";

interface CrisisProps {
  onNavigate: (screen: string) => void;
}

export function CrisisSupport({ onNavigate }: CrisisProps) {
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState<number>(4);
  const [isBreathing, setIsBreathing] = useState<boolean>(false);
  const [currentGroundingStep, setCurrentGroundingStep] = useState<number>(0);
  const [isGrounding, setIsGrounding] = useState<boolean>(false);
  const [panicAttackMode, setPanicAttackMode] = useState<boolean>(false);

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
        {/* Panic Attack Recognition & Immediate Help */}
        <Card className="shadow-soft border-crisis/20 bg-crisis/5">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-crisis mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Panic Attack Support</h2>
            <p className="text-muted-foreground mb-4">
              If you're experiencing a panic attack, remember: this will pass. 
              You're safe, and these feelings are temporary.
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={() => setPanicAttackMode(true)}
                className="bg-crisis hover:bg-crisis/90"
              >
                I'm Having a Panic Attack
              </Button>
              <Button 
                onClick={() => onNavigate('dashboard')}
                className="bg-wellness hover:bg-wellness/90"
              >
                I'm Safe Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Panic Attack Mode - Immediate Grounding */}
        {panicAttackMode && (
          <Card className="shadow-soft border-wellness/20 bg-wellness/5 animate-pulse">
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 text-wellness mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2 text-wellness">Emergency Grounding</h2>
              <p className="text-muted-foreground mb-4">
                Focus on this right now. You're going to be okay.
              </p>
              <Button 
                onClick={() => setIsGrounding(true)}
                className="bg-wellness hover:bg-wellness/90 w-full"
                size="lg"
              >
                Start Emergency Grounding
              </Button>
            </CardContent>
          </Card>
        )}

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

        {/* Enhanced Breathing Exercise */}
        <Card className="shadow-wellness">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Waves className="h-5 w-5 text-wellness" />
              Panic Attack Breathing Exercise
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">
              Slow, controlled breathing helps calm your nervous system during panic attacks.
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
              
              <div className="text-xs text-wellness bg-wellness/10 p-2 rounded">
                💡 Tip: Focus on the circle expanding and contracting with your breath
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Grounding Techniques */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Enhanced Grounding Techniques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Interactive 5-4-3-2-1 Grounding */}
              <div className="p-4 rounded-lg bg-muted/50 border-2 border-wellness/20">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-wellness" />
                  5-4-3-2-1 Sensory Grounding
                </h4>
                {isGrounding ? (
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-wellness mb-2">
                        {currentGroundingStep === 0 && "5 Things You Can See"}
                        {currentGroundingStep === 1 && "4 Things You Can Touch"}
                        {currentGroundingStep === 2 && "3 Things You Can Hear"}
                        {currentGroundingStep === 3 && "2 Things You Can Smell"}
                        {currentGroundingStep === 4 && "1 Thing You Can Taste"}
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Take your time to really notice each one
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button 
                          size="sm"
                          onClick={() => setCurrentGroundingStep(Math.max(0, currentGroundingStep - 1))}
                          disabled={currentGroundingStep === 0}
                        >
                          Previous
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => setCurrentGroundingStep(Math.min(4, currentGroundingStep + 1))}
                          className="bg-wellness hover:bg-wellness/90"
                        >
                          {currentGroundingStep === 4 ? 'Finish' : 'Next'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-3">
                      Interactive sensory grounding exercise
                    </p>
                    <Button 
                      size="sm"
                      onClick={() => setIsGrounding(true)}
                      className="bg-wellness hover:bg-wellness/90"
                    >
                      Start Interactive Grounding
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Progressive Muscle Relaxation */}
              <div className="p-4 rounded-lg bg-muted/50 border-2 border-accent/20">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" />
                  Progressive Muscle Relaxation
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Tense and release each muscle group to reduce physical tension
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-accent/10 rounded">Feet & Calves</div>
                  <div className="p-2 bg-accent/10 rounded">Thighs</div>
                  <div className="p-2 bg-accent/10 rounded">Stomach</div>
                  <div className="p-2 bg-accent/10 rounded">Chest</div>
                  <div className="p-2 bg-accent/10 rounded">Arms</div>
                  <div className="p-2 bg-accent/10 rounded">Face</div>
                </div>
              </div>
              
              {/* Temperature Regulation */}
              <div className="p-4 rounded-lg bg-muted/50 border-2 border-primary/20">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-primary" />
                  Temperature Regulation
                </h4>
                <p className="text-xs text-muted-foreground">
                  Hold an ice cube or warm drink to help regulate your nervous system
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Panic Attack Education */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Understanding Panic Attacks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="p-3 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">What's Happening</h4>
                <p className="text-muted-foreground text-xs">
                  A panic attack is your body's fight-or-flight response activating. Your heart races, 
                  breathing quickens, and you may feel like you're dying. This is normal and will pass.
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">Remember</h4>
                <ul className="text-muted-foreground text-xs space-y-1">
                  <li>• Panic attacks typically peak within 10 minutes</li>
                  <li>• You cannot die from a panic attack</li>
                  <li>• These feelings are temporary</li>
                  <li>• You're safe right now</li>
                </ul>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">After the Attack</h4>
                <p className="text-muted-foreground text-xs">
                  Be gentle with yourself. Rest, hydrate, and consider talking to a mental health professional 
                  about developing a long-term management plan.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}