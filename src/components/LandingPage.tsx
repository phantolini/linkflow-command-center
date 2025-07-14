
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, BarChart3, Smartphone, ExternalLink, ArrowRight, Sparkles } from "lucide-react";
import { AuthPage } from "@/components/AuthPage";

export const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full blur-3xl floating-animation" style={{ animationDelay: '-4s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-teal-500/10 rounded-full blur-3xl floating-animation" style={{ animationDelay: '-8s' }}></div>
      </div>

      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 relative">
                <img 
                  src="/lovable-uploads/d260a0ec-5de2-4c2b-bfee-56c85b40e602.png" 
                  alt="SAWD Logo" 
                  className="w-full h-full object-contain filter drop-shadow-lg"
                />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                SAWD LINK
              </h1>
            </div>
            <Button
              onClick={() => setShowAuth(true)}
              className="btn-glass-primary hover:scale-105 transition-all duration-300"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="w-24 h-24 mx-auto mb-8 relative floating-animation">
            <img 
              src="/lovable-uploads/d260a0ec-5de2-4c2b-bfee-56c85b40e602.png" 
              alt="SAWD Logo" 
              className="w-full h-full object-contain filter drop-shadow-2xl"
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Your Digital
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent block mt-2">
              Command Center
            </span>
          </h1>

          <p className="text-xl text-slate-300/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Create stunning bio-link pages with real-time analytics. Share your entire digital presence through one powerful link with our glassmorphism-powered interface.
          </p>

          <Card className="glass-card max-w-md mx-auto mb-16 hover-lift glow-effect">
            <CardHeader>
              <CardTitle className="text-white text-center flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                Launch Your Command Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowAuth(true)}
                className="w-full h-12 btn-glass-primary font-semibold hover:scale-105 transition-all duration-300 group"
              >
                <span className="flex items-center justify-center gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <p className="text-xs text-slate-400 text-center mt-4">
                No credit card required. Create your page in minutes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="h-8 w-8" />}
            title="Instant Creation"
            description="Build your bio-link page in seconds with our intuitive drag-and-drop interface. No coding required."
          />
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Real-time Analytics"
            description="Track every click, view, and interaction with detailed analytics and insights."
          />
          <FeatureCard
            icon={<Smartphone className="h-8 w-8" />}
            title="Mobile-First Design"
            description="Perfectly optimized for mobile devices where your audience spends most of their time."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8" />}
            title="Secure & Private"
            description="Your data is protected with enterprise-grade security and privacy controls."
          />
          <FeatureCard
            icon={<ExternalLink className="h-8 w-8" />}
            title="Custom Domains"
            description="Use your own domain for a professional, branded experience."
          />
          <FeatureCard
            icon={<Sparkles className="h-8 w-8" />}
            title="Glassmorphism UI"
            description="Beautiful, modern interface with stunning visual effects and smooth animations."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-white/10 backdrop-blur-xl relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 relative">
                <img 
                  src="/lovable-uploads/d260a0ec-5de2-4c2b-bfee-56c85b40e602.png" 
                  alt="SAWD Logo" 
                  className="w-full h-full object-contain filter drop-shadow-lg"
                />
              </div>
              <span className="text-slate-300 font-bold text-lg bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">SAWD LINK</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2024 SAWD LINK. Built for creators, by creators.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) => (
  <Card className="glass-card hover-lift transition-all duration-300 group border-white/10">
    <CardContent className="p-6">
      <div className="w-14 h-14 glass rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 glow-effect">
        <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);
