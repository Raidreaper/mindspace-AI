import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Brain, Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

export default function Auth() {
  const { signInWithGoogle, loading, user } = useAuth();
  const navigate = useNavigate();
  
  const handleGoogle = async () => {
    await signInWithGoogle();
  };

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">MindSpace AI</h1>
          </div>
        </div>
        
        <Card className="border-border/50 backdrop-blur-sm bg-card/80">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>
              Sign in to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={handleGoogle} className="w-full" variant="outline" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Redirecting to Google...
                      </>
                    ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">G</span>
                    <span>Continue with Google</span>
                  </div>
                    )}
                  </Button>
                  </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}