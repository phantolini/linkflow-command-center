import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, QrCode, Share } from "lucide-react";
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

interface Link {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const ProfilePreview = ({ profile }: { profile: Profile }) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [showQR, setShowQR] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadLinks();
  }, [profile.id]);

  const loadLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading links",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLinkClick = async (link: Link) => {
    // Track click - provide profile_id explicitly to satisfy TypeScript
    try {
      await supabase
        .from('link_clicks')
        .insert({
          link_id: link.id,
          profile_id: link.profile_id,
          clicked_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking click:', error);
    }

    // Open link
    window.open(link.url, '_blank');
  };

  const copyProfileUrl = () => {
    const url = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Profile URL copied to clipboard",
    });
  };

  const shareProfile = async () => {
    const url = `${window.location.origin}/${profile.username}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.display_name} - LinkFlow`,
          text: profile.bio || '',
          url: url,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      copyProfileUrl();
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Preview Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Live Preview</h2>
        <p className="text-slate-400">This is how your profile will look to visitors</p>
        
        {profile.is_public && (
          <div className="flex gap-2 justify-center mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={shareProfile}
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowQR(!showQR)}
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <QrCode className="h-4 w-4 mr-1" />
              QR Code
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Preview Frame */}
      <div className="relative">
        <div className="w-full max-w-sm mx-auto bg-black rounded-3xl p-1 shadow-2xl shadow-cyan-500/20">
          <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-[20px] p-6 min-h-[600px]">
            
            {/* Profile Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {profile.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <h1 className="text-xl font-bold text-white mb-2">
                {profile.display_name}
              </h1>
              
              <p className="text-slate-300 text-sm mb-3">
                {profile.bio}
              </p>

              <Badge 
                variant="secondary" 
                className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
              >
                @{profile.username}
              </Badge>
            </div>

            {/* Links */}
            <div className="space-y-3">
              {links.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ExternalLink className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-slate-400 text-sm">No active links</p>
                  <p className="text-slate-500 text-xs mt-1">Add some links in the editor</p>
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
                      <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="text-center mt-8 pt-6 border-t border-slate-700/50">
              <p className="text-xs text-slate-500">
                Powered by LinkFlow
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && profile.is_public && (
        <Card className="mt-6 bg-black/40 border-slate-700/50 backdrop-blur-md">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-4">QR Code</h3>
            <div className="w-48 h-48 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
              <p className="text-slate-600 text-sm">QR Code will be generated here</p>
            </div>
            <p className="text-slate-400 text-sm">
              Scan to visit: /{profile.username}
            </p>
          </CardContent>
        </Card>
      )}

      {!profile.is_public && (
        <Card className="mt-6 bg-amber-500/10 border-amber-500/30 backdrop-blur-md">
          <CardContent className="p-4 text-center">
            <p className="text-amber-300 text-sm font-medium">⚠️ Profile is Private</p>
            <p className="text-amber-400/80 text-xs mt-1">
              Enable "Public Profile" in settings to make it accessible to others
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
