
import { useState, useEffect } from "react";
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Plus, Eye, BarChart3, Settings, ExternalLink } from "lucide-react";
import { LinkEditor } from "@/components/LinkEditor";
import { ProfilePreview } from "@/components/ProfilePreview";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { SetupWizard } from "@/components/SetupWizard";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  theme: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const Dashboard = ({ user }: { user: User }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'analytics'>('editor');
  const [loading, setLoading] = useState(true);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        // Show setup wizard if profile is not public yet
        if (!data.is_public) {
          setShowSetupWizard(true);
        }
      } else {
        // Create default profile and show setup wizard
        await createDefaultProfile();
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultProfile = async () => {
    try {
      const username = user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`;
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          username,
          display_name: username,
          bio: 'Welcome to my link tree!',
          theme: 'cyber',
          is_public: false
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      setShowSetupWizard(true);
    } catch (error: any) {
      toast({
        title: "Error creating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSetupComplete = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    setShowSetupWizard(false);
    toast({
      title: "🎉 Profile Published!",
      description: `Your profile is now live at /${updatedProfile.username}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 animate-pulse floating-animation">
            <img 
              src="/lovable-uploads/69e7d46f-8144-4149-9a8d-cacef5727c53.png" 
              alt="SAWD Logo" 
              className="w-full h-full object-contain filter drop-shadow-lg"
            />
          </div>
          <p className="text-slate-200 font-medium">Initializing command center...</p>
        </div>
      </div>
    );
  }

  if (showSetupWizard && profile) {
    return (
      <div className="min-h-screen animated-bg p-4 flex items-center justify-center">
        <SetupWizard profile={profile} onComplete={handleSetupComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-cyan-400/5 to-blue-500/5 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-400/5 to-pink-500/5 rounded-full blur-3xl floating-animation" style={{ animationDelay: '-5s' }}></div>
      </div>

      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 relative">
                <img 
                  src="/lovable-uploads/69e7d46f-8144-4149-9a8d-cacef5727c53.png" 
                  alt="SAWD Logo" 
                  className="w-full h-full object-contain filter drop-shadow-lg"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  SAWD LINK
                </h1>
                <p className="text-xs text-slate-400">
                  {profile?.username && `@${profile.username}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {profile?.is_public && (
                <Button
                  variant="outline"
                  size="sm"
                  className="btn-glass border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                  onClick={() => window.open(`/${profile.username}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Live
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSetupWizard(true)}
                className="btn-glass border-white/20 text-slate-300 hover:bg-white/10"
              >
                <Settings className="h-4 w-4 mr-1" />
                Setup
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="btn-glass border-white/20 text-slate-300 hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-2 mt-6">
            {[
              { id: 'editor', label: 'Editor', icon: Settings },
              { id: 'preview', label: 'Preview', icon: Eye },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  ${activeTab === tab.id 
                    ? 'btn-glass-primary border-cyan-500/50 text-cyan-400' 
                    : 'btn-glass text-slate-400 hover:text-slate-200'
                  }
                  transition-all duration-300 hover:scale-105
                `}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 relative z-10">
        {profile && (
          <>
            {activeTab === 'editor' && (
              <LinkEditor profile={profile} onProfileUpdate={setProfile} />
            )}
            {activeTab === 'preview' && (
              <ProfilePreview profile={profile} />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsDashboard profile={profile} />
            )}
          </>
        )}
      </main>
    </div>
  );
};
