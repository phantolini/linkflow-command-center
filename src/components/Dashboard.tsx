
import { useState, useEffect } from "react";
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { DashboardContent } from "./dashboard/DashboardContent";
import { useToast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, [user.id]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, create one
          await createProfile();
        } else {
          throw error;
        }
      } else {
        setProfile(data);
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

  const createProfile = async () => {
    try {
      const username = user.email?.split('@')[0] || 'user';
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          username: username,
          display_name: user.user_metadata?.full_name || username,
          bio: '',
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

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-400"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Setup Required</h2>
          <p className="text-white/60">There was an issue creating your profile. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black relative overflow-hidden">
      {/* Animated fluid blob backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-fuchsia-400/20 to-pink-500/20 rounded-full mix-blend-multiply filter blur-xl blob-animation"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-fuchsia-500/20 rounded-full mix-blend-multiply filter blur-xl blob-animation-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-xl blob-animation-delayed-2"></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-gradient-to-r from-fuchsia-300/15 to-pink-400/15 rounded-full filter blur-xl blob-animation"></div>
      </div>

      <div className="relative z-10">
        <DashboardHeader profile={profile} />
        <DashboardContent 
          profile={profile} 
          userId={user.id}
          onProfileUpdate={handleProfileUpdate}
        />
      </div>
    </div>
  );
};
