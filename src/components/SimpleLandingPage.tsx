
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, BarChart3, Smartphone, ExternalLink, ArrowRight, Sparkles } from "lucide-react";

interface SimpleLandingPageProps {
  onGetStarted: () => void;
}

export const SimpleLandingPage = ({ onGetStarted }: SimpleLandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <header className="backdrop-blur-xl bg-black/20 border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              SAWD LINK
            </h1>
            <Button onClick={onGetStarted} className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white">
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Your Digital
            <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent block mt-2">
              Command Center
            </span>
          </h1>

          <p className="text-xl text-slate-200/90 mb-8 leading-relaxed max-w-2xl mx-auto">
            Create stunning bio-link pages with real-time analytics. Share your entire digital presence through one powerful link.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mb-12 text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Setup in 2 Minutes
            </div>
            <div className="flex items-center gap-2 text-cyan-400">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              Unlimited Links
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              Real-time Analytics
            </div>
          </div>

          <Card className="max-w-md mx-auto bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                Launch Your Command Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={onGetStarted} className="w-full h-12 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold">
                Get Started Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard icon={<Zap className="h-6 w-6" />} title="Instant Creation" description="Build your bio-link page in seconds" />
          <FeatureCard icon={<BarChart3 className="h-6 w-6" />} title="Analytics" description="Track every click and interaction" />
          <FeatureCard icon={<Smartphone className="h-6 w-6" />} title="Mobile-First" description="Optimized for mobile devices" />
          <FeatureCard icon={<ExternalLink className="h-6 w-6" />} title="Custom Links" description="Add unlimited custom links" />
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <Card className="bg-black/40 border-white/10 backdrop-blur-md hover:bg-black/50 transition-all duration-300">
    <CardContent className="p-6 text-center">
      <div className="w-12 h-12 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
        <div className="text-cyan-400">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-300/90 text-sm">{description}</p>
    </CardContent>
  </Card>
);
