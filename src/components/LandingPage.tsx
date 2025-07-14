
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link, Zap, BarChart3, Shield, Sparkles, Command } from "lucide-react";

export const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

      toast({
        title: "Magic link sent!",
        description: "Check your email for a secure sign-in link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-cyan-500/20 bg-black/20 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Command className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                LinkFlow
              </h1>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Command Your
                <br />
                Digital Presence
              </h1>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                High-performance bio-link builder with command center aesthetics. 
                Create, customize, and deploy your digital identity with zero friction.
              </p>
            </div>

            {/* Sign-in Form */}
            <Card className="max-w-md mx-auto mb-12 bg-black/40 border-cyan-500/30 backdrop-blur-md">
              <CardContent className="p-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white border-0 h-11 font-semibold"
                  >
                    {isLoading ? "Initializing..." : "Launch Command Center"}
                  </Button>
                </form>
                <p className="text-sm text-slate-400 mt-4">
                  Magic link authentication - no passwords required
                </p>
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <FeatureCard
                icon={Zap}
                title="Instant Deploy"
                description="Zero-friction creation with live preview and autosave"
              />
              <FeatureCard
                icon={BarChart3}
                title="Command Analytics"
                description="Real-time metrics and click tracking dashboard"
              />
              <FeatureCard
                icon={Shield}
                title="Secure by Design"
                description="Enterprise-grade security with isolated user data"
              />
            </div>

            {/* Tech Stack Indicator */}
            <div className="flex items-center justify-center gap-4 text-slate-500 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span>Real-time</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-300"></div>
                <span>Cloud-native</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-600"></div>
                <span>Mobile-first</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: {
  icon: any;
  title: string;
  description: string;
}) => (
  <Card className="bg-black/30 border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
    <CardContent className="p-6 text-center">
      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
        <Icon className="h-6 w-6 text-cyan-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-300 text-sm">{description}</p>
    </CardContent>
  </Card>
);
