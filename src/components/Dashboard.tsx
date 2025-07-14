
import { useState, useEffect } from "react";
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Command, LogOut, Plus, Eye, BarChart3, Settings, ExternalLink } from "lucide-react";
import { LinkEditor } from "@/components/LinkEditor";
import { ProfilePreview } from "@/components/ProfilePreview";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

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
      } else {
        // Create default profile
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Command className="h-4 w-4 text-white" />
          </div>
          <p className="text-slate-300">Initializing command center...</p>
        </div>
      </div>
    );
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
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
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
                  className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                  onClick={() => window.open(`/${profile.username}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Live
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-1 mt-4">
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
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' 
                    : 'text-slate-400 hover:text-slate-200'
                  }
                  border border-transparent hover:border-slate-600
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
      <main className="container mx-auto px-4 py-6">
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
