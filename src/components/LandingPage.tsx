
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, Zap, Shield, BarChart3, Smartphone, ExternalLink } from "lucide-react";
import { AuthPage } from "@/components/AuthPage";

export const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-cyan-500/20 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Command className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                SAWD LINK
              </h1>
            </div>
            <Button
              onClick={() => setShowAuth(true)}
              variant="outline"
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Command className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Your Digital
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {" "}Command Center
            </span>
          </h1>

          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Create stunning bio-link pages with real-time analytics. Share your entire digital presence through one powerful link.
          </p>

          <Card className="bg-black/40 border-slate-700/50 backdrop-blur-md max-w-md mx-auto mb-12">
            <CardHeader>
              <CardTitle className="text-white text-center">
                Launch Your Command Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowAuth(true)}
                className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 transition-all duration-300"
              >
                Get Started Free
              </Button>
              <p className="text-xs text-slate-400 text-center mt-4">
                No credit card required. Create your page in minutes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
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
            icon={<Command className="h-8 w-8" />}
            title="Command Center UI"
            description="Manage everything from one powerful dashboard designed for efficiency."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Command className="h-3 w-3 text-white" />
              </div>
              <span className="text-slate-300 font-medium">SAWD LINK</span>
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
  <Card className="bg-black/40 border-slate-700/50 backdrop-blur-md hover:border-cyan-500/30 transition-all duration-300 group">
    <CardContent className="p-6">
      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-all duration-300">
        <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);
