import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, BarChart3, Smartphone, ExternalLink, ArrowRight, Sparkles, Star } from "lucide-react";
import { AuthPage } from "@/components/AuthPage";
export const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false);
  if (showAuth) {
    return <AuthPage />;
  }
  return <div className="min-h-screen animated-bg relative overflow-hidden">
      {/* Enhanced floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl floating-animation" style={{
        animationDelay: '-4s'
      }}></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl floating-animation" style={{
        animationDelay: '-8s'
      }}></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-yellow-400/15 to-orange-500/15 rounded-full blur-3xl floating-animation" style={{
        animationDelay: '-12s'
      }}></div>
      </div>

      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 relative">
                <img src="/lovable-uploads/69e7d46f-8144-4149-9a8d-cacef5727c53.png" alt="SAWD Logo" className="w-full h-full object-contain filter drop-shadow-lg" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-slate-50">
                SAWD LINK
              </h1>
            </div>
            <Button onClick={() => setShowAuth(true)} className="btn-glass-primary hover:scale-105 transition-all duration-300 group">
              <span className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="w-24 h-24 mx-auto mb-8 relative floating-animation">
            <img src="/lovable-uploads/69e7d46f-8144-4149-9a8d-cacef5727c53.png" alt="SAWD Logo" className="w-full h-full object-contain filter drop-shadow-2xl" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            
            <span className="font-semibold text-slate-50">100% Free Forever</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Your Digital
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent block mt-2">
              Command Center
            </span>
          </h1>

          <p className="text-xl text-slate-200/90 mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
            Create stunning bio-link pages with <span className="text-cyan-400 font-semibold">real-time analytics</span>. 
            Share your entire digital presence through one powerful link with our glassmorphism-powered interface.
          </p>

          <div className="flex items-center justify-center gap-6 mb-12 text-sm">
            <div className="flex items-center gap-2 text-green-400 font-medium">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              No Credit Card Required
            </div>
            <div className="flex items-center gap-2 text-cyan-400 font-medium">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              Setup in 2 Minutes
            </div>
            <div className="flex items-center gap-2 text-purple-400 font-medium">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              Unlimited Links
            </div>
          </div>

          <Card className="glass-card max-w-md mx-auto mb-16 hover-lift glow-effect">
            <CardHeader>
              <CardTitle className="text-white text-center flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                Launch Your Command Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowAuth(true)} className="w-full h-14 btn-glass-primary font-semibold text-lg hover:scale-105 transition-all duration-300 group bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500">
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Get Started Free with Google
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <p className="text-xs text-slate-300 text-center mt-4 font-medium">
                ✨ <span className="text-green-400">Free Forever</span> • Create your page in under 2 minutes
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything You Need, <span className="text-cyan-400">Completely Free</span>
          </h2>
          <p className="text-slate-300/90 text-lg">
            Professional features without the premium price tag
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard icon={<Zap className="h-8 w-8" />} title="Instant Creation" description="Build your bio-link page in seconds with our intuitive drag-and-drop interface. No coding required." />
          <FeatureCard icon={<BarChart3 className="h-8 w-8" />} title="Real-time Analytics" description="Track every click, view, and interaction with detailed analytics and insights." />
          <FeatureCard icon={<Smartphone className="h-8 w-8" />} title="Mobile-First Design" description="Perfectly optimized for mobile devices where your audience spends most of their time." />
          <FeatureCard icon={<Shield className="h-8 w-8" />} title="Secure & Private" description="Your data is protected with enterprise-grade security and privacy controls." />
          <FeatureCard icon={<ExternalLink className="h-8 w-8" />} title="Custom Domains" description="Use your own domain for a professional, branded experience." />
          <FeatureCard icon={<Sparkles className="h-8 w-8" />} title="Glassmorphism UI" description="Beautiful, modern interface with stunning visual effects and smooth animations." />
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-white/10 backdrop-blur-xl relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 relative">
                <img src="/lovable-uploads/69e7d46f-8144-4149-9a8d-cacef5727c53.png" alt="SAWD Logo" className="w-full h-full object-contain filter drop-shadow-lg" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-slate-50">SAWD LINK</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2024 SAWD LINK. Built for creators, by creators. Always free.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
const FeatureCard = ({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => <Card className="glass-card hover-lift transition-all duration-300 group border-white/10">
    <CardContent className="p-6">
      <div className="w-14 h-14 glass rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 glow-effect">
        <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-slate-300/90 text-sm leading-relaxed">{description}</p>
    </CardContent>
  </Card>;