
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Command, Share2, QrCode } from "lucide-react";
import { LinkCard } from "@/components/LinkCard";

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
  position: number;
  is_active: boolean;
}

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    if (!username) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .eq('is_public', true)
        .maybeSingle();

      if (profileError || !profileData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Load links
      const { data: linksData, error: linksError } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', profileData.id)
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (!linksError && linksData) {
        setLinks(linksData);
      }

      // Track profile view
      await supabase
        .from('profile_views')
        .insert({
          profile_id: profileData.id,
          viewed_at: new Date().toISOString(),
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
        });

    } catch (error) {
      console.error('Error loading profile:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (linkId: string) => {
    if (!profile) return;

    try {
      await supabase
        .from('link_clicks')
        .insert({
          link_id: linkId,
          profile_id: profile.id,
          clicked_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error tracking link click:', error);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.display_name}'s Links`,
          url: url,
        });
      } catch (error) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(url);
      }
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Command className="h-4 w-4 text-white" />
          </div>
          <p className="text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-black/40 border-slate-700/50 backdrop-blur-md max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold text-white mb-4">Profile Not Found</h1>
            <p className="text-slate-400 mb-6">
              The profile you're looking for doesn't exist or isn't public.
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container max-w-md mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="bg-black/40 border-slate-700/50 backdrop-blur-md mb-6">
          <CardContent className="p-6 text-center">
            <div className="relative mb-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-cyan-500/50"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-white">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {profile.display_name}
            </h1>
            <p className="text-cyan-400 text-sm mb-3">@{profile.username}</p>
            {profile.bio && (
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                {profile.bio}
              </p>
            )}
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Profile
            </Button>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="space-y-3">
          {links.map((link) => (
            <LinkCard
              key={link.id}
              title={link.title}
              url={link.url}
              description={link.description || undefined}
              onClick={() => handleLinkClick(link.id)}
            />
          ))}
        </div>

        {links.length === 0 && (
          <Card className="bg-black/40 border-slate-700/50 backdrop-blur-md">
            <CardContent className="p-8 text-center">
              <p className="text-slate-400">
                No links have been added yet.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-slate-700/50">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
            <Command className="h-4 w-4" />
            <span>Powered by SAWD LINK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
