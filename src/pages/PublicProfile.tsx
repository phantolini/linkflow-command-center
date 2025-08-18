
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, Profile, Link } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, ExternalLink } from "lucide-react";

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
      const profileData = await api.getPublicProfile(username);
      
      if (!profileData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(profileData);
      
      const linksData = await api.getLinks(profileData.id);
      setLinks(linksData.filter(link => link.is_active));

      // Track profile view
      await api.trackProfileView(profileData.id);
    } catch (error) {
      console.error('Error loading profile:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (link: Link) => {
    if (!profile) return;

    try {
      await api.trackLinkClick(link.id, profile.id);
      window.open(link.url, '_blank');
    } catch (error) {
      console.error('Error tracking link click:', error);
      // Still open the link even if tracking fails
      window.open(link.url, '_blank');
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
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto bg-black/40 border-white/10 backdrop-blur-md text-center">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold text-white mb-4">Profile Not Found</h1>
            <p className="text-slate-400 mb-6">
              The profile you're looking for doesn't exist or isn't public.
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-8 relative z-10">
        {/* Profile Header */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-md mb-6 hover:bg-black/50 transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="mb-6">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-cyan-500/50"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-white">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {profile.display_name}
            </h1>
            <p className="text-cyan-400 text-sm mb-4 font-medium">@{profile.username}</p>
            {profile.bio && (
              <p className="text-slate-300/90 text-sm mb-6 leading-relaxed">
                {profile.bio}
              </p>
            )}
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="border-white/30 text-slate-300 hover:bg-white/10 bg-transparent"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Profile
            </Button>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="space-y-4">
          {links.map((link) => (
            <Card
              key={link.id}
              className="bg-black/40 border-white/10 backdrop-blur-md hover:bg-black/50 transition-all duration-300 cursor-pointer group"
              onClick={() => handleLinkClick(link)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                      {link.title}
                    </h3>
                    {link.description && (
                      <p className="text-slate-400 text-sm mt-1">
                        {link.description}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 transition-colors ml-3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {links.length === 0 && (
          <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardContent className="p-8 text-center">
              <p className="text-slate-400">No links have been added yet.</p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
            <span>Powered by SAWD LINK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
