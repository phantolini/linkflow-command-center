
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  theme: string;
  is_public: boolean;
}

interface Link {
  id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  position: number;
  is_active: boolean;
}

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .eq('is_public', true)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!profileData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Load active links
      const { data: linksData, error: linksError } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', profileData.id)
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (linksError) throw linksError;
      setLinks(linksData || []);

      // Track profile view
      await supabase
        .from('profile_views')
        .insert({
          profile_id: profileData.id,
          viewed_at: new Date().toISOString(),
          referrer: document.referrer || null,
          user_agent: navigator.userAgent
        });
        
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (link: Link) => {
    // Track click
    try {
      await supabase
        .from('link_clicks')
        .insert({
          link_id: link.id,
          profile_id: profile!.id,
          clicked_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking click:', error);
    }

    // Open link
    window.open(link.url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="h-4 w-4 bg-white rounded"></div>
          </div>
          <p className="text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Profile Not Found</h1>
          <p className="text-slate-400 mb-6">This profile doesn't exist or has been made private.</p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg hover:from-cyan-500 hover:to-purple-500 transition-colors"
          >
            Create Your Own LinkFlow
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {profile.display_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              {profile.display_name}
            </h1>
            
            {profile.bio && (
              <p className="text-slate-300 text-sm mb-4">
                {profile.bio}
              </p>
            )}

            <Badge 
              variant="secondary" 
              className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
            >
              @{profile.username}
            </Badge>
          </div>

          {/* Links */}
          <div className="space-y-4">
            {links.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ExternalLink className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-400 text-sm">No links available</p>
              </div>
            ) : (
              links.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link)}
                  className="w-full p-4 bg-black/40 hover:bg-black/60 border border-slate-700/50 hover:border-cyan-500/50 rounded-xl transition-all duration-200 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                        {link.title}
                      </h3>
                      {link.description && (
                        <p className="text-sm text-slate-400 mt-1">
                          {link.description}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition-colors ml-3 flex-shrink-0" />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-12 pt-6 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 mb-2">
              Create your own link tree
            </p>
            <a 
              href="/" 
              className="inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Powered by LinkFlow
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
