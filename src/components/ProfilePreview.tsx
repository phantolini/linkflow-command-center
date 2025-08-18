import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, QrCode, Share, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSocialIcon } from "@/utils/socialIcons";
import { api, Profile, Link } from "@/services/api";

export const ProfilePreview = ({ profile }: { profile: Profile }) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [showQR, setShowQR] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadLinks();
  }, [profile.id]);

  const loadLinks = async () => {
    try {
      const allLinks = await api.getLinks(profile.id);
      const activeLinks = allLinks.filter(link => link.is_active);
      setLinks(activeLinks);
    } catch (error: any) {
      toast({
        title: "Error loading links",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLinkClick = async (link: Link) => {
    // Track click in your platform's analytics
    try {
      await api.trackLinkClick(link.id, profile.id);
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
          title: `${profile.display_name} - SAWD LINK`,
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
        <p className="text-white/60">This is how your profile will look to visitors</p>
        
        {profile.is_public && (
          <div className="flex gap-2 justify-center mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={shareProfile}
              className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 backdrop-blur-sm"
            >
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowQR(!showQR)}
              className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10 backdrop-blur-sm"
            >
              <QrCode className="h-4 w-4 mr-1" />
              QR Code
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Preview Frame */}
      <div className="relative">
        <div className="w-full max-w-sm mx-auto bg-black/80 rounded-3xl p-1 shadow-2xl shadow-cyan-500/20 border border-white/10 backdrop-blur-md">
          <div className="bg-gradient-to-br from-black/60 via-purple-900/60 to-black/60 rounded-[20px] p-6 min-h-[600px] backdrop-blur-sm border border-white/5">
            
            {/* Profile Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden bg-gradient-to-br from-cyan-400/20 to-purple-600/20 border border-white/10 backdrop-blur-md flex items-center justify-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-white/60" />
                )}
              </div>
              
              <h1 className="text-xl font-bold text-white mb-2">
                {profile.display_name}
              </h1>
              
              <p className="text-white/80 text-sm mb-3">
                {profile.bio}
              </p>

              <Badge 
                variant="secondary" 
                className="bg-cyan-400/20 text-cyan-300 border-cyan-400/30 backdrop-blur-sm"
              >
                @{profile.username}
              </Badge>
            </div>

            {/* Links */}
            <div className="space-y-3">
              {links.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10">
                    <ExternalLink className="h-6 w-6 text-white/60" />
                  </div>
                  <p className="text-white/60 text-sm">No active links</p>
                  <p className="text-white/40 text-xs mt-1">Add some links in the editor</p>
                </div>
              ) : (
                links.map((link) => {
                  const SocialIcon = getSocialIcon(link.url);
                  return (
                    <button
                      key={link.id}
                      onClick={() => handleLinkClick(link)}
                      className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 rounded-xl transition-all duration-200 text-left group backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {SocialIcon && (
                            <div className="w-6 h-6 flex items-center justify-center">
                              <SocialIcon className="w-5 h-5 text-white/80 group-hover:text-cyan-400 transition-colors" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                              {link.title}
                            </h3>
                            {link.description && (
                              <p className="text-sm text-white/60 mt-1">
                                {link.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-white/60 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="text-center mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-white/40">
                Powered by SAWD LINK
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && profile.is_public && (
        <Card className="mt-6 bg-black/40 border-white/10 backdrop-blur-md">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-4">QR Code</h3>
            <div className="w-48 h-48 bg-white/90 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <p className="text-slate-600 text-sm">QR Code will be generated here</p>
            </div>
            <p className="text-white/60 text-sm">
              Scan to visit: /{profile.username}
            </p>
          </CardContent>
        </Card>
      )}

      {!profile.is_public && (
        <Card className="mt-6 bg-amber-500/10 border-amber-400/30 backdrop-blur-md">
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
