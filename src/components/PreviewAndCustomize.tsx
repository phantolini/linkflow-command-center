
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Palette, Layout, Sparkles, User, ExternalLink } from "lucide-react";
import { getSocialIcon } from "@/utils/socialIcons";
import { api, Profile, Link } from "@/services/api";

interface PreviewAndCustomizeProps {
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
}

const themes = [
  { id: 'cyber', name: 'Cyber', preview: 'bg-gradient-to-br from-purple-900 to-blue-900' },
  { id: 'neon', name: 'Neon', preview: 'bg-gradient-to-br from-pink-900 to-purple-900' },
  { id: 'forest', name: 'Forest', preview: 'bg-gradient-to-br from-green-900 to-emerald-900' },
  { id: 'sunset', name: 'Sunset', preview: 'bg-gradient-to-br from-orange-900 to-red-900' },
  { id: 'ocean', name: 'Ocean', preview: 'bg-gradient-to-br from-blue-900 to-cyan-900' },
  { id: 'minimal', name: 'Minimal', preview: 'bg-gradient-to-br from-slate-900 to-gray-900' }
];

const getThemeStyles = (theme: string) => {
  switch (theme) {
    case 'cyber':
      return 'bg-gradient-to-br from-purple-900/60 via-blue-900/60 to-black/60';
    case 'neon':
      return 'bg-gradient-to-br from-pink-900/60 via-purple-900/60 to-black/60';
    case 'forest':
      return 'bg-gradient-to-br from-green-900/60 via-emerald-900/60 to-black/60';
    case 'sunset':
      return 'bg-gradient-to-br from-orange-900/60 via-red-900/60 to-black/60';
    case 'ocean':
      return 'bg-gradient-to-br from-blue-900/60 via-cyan-900/60 to-black/60';
    case 'minimal':
      return 'bg-gradient-to-br from-slate-900/60 via-gray-900/60 to-black/60';
    default:
      return 'bg-gradient-to-br from-black/60 via-purple-900/60 to-black/60';
  }
};

export const PreviewAndCustomize = ({ profile, onProfileUpdate }: PreviewAndCustomizeProps) => {
  const [selectedTheme, setSelectedTheme] = useState(profile.theme);
  const [links, setLinks] = useState<Link[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadLinks();
  }, [profile.id]);

  const loadLinks = async () => {
    try {
      const data = await api.getLinks(profile.id);
      setLinks(data.filter((link: Link) => link.is_active) || []);
    } catch (error: any) {
      toast({
        title: "Error loading links",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateTheme = async (themeId: string) => {
    setSelectedTheme(themeId);
    
    setIsUpdating(true);
    try {
      const updatedProfile = await api.updateProfile(profile.id, { 
        theme: themeId, 
        updated_at: new Date().toISOString() 
      });
      
      onProfileUpdate(updatedProfile);
      
      toast({
        title: "Theme updated",
        description: "Your profile theme has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating theme",
        description: error.message,
        variant: "destructive",
      });
      setSelectedTheme(profile.theme); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLinkClick = async (link: Link) => {
    // Track click
    try {
      await api.trackLinkClick(link.id, link.profile_id);
    } catch (error) {
      console.error('Error tracking click:', error);
    }

    // Open link
    window.open(link.url, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Theme Customizer */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Palette className="h-5 w-5 text-cyan-400" />
            Theme Customization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-white/80 mb-4 block">Choose Theme</Label>
            <RadioGroup
              value={selectedTheme}
              onValueChange={updateTheme}
              disabled={isUpdating}
              className="grid grid-cols-2 gap-4"
            >
              {themes.map((theme) => (
                <div key={theme.id} className="relative">
                  <RadioGroupItem
                    value={theme.id}
                    id={theme.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={theme.id}
                    className={`
                      flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${selectedTheme === theme.id 
                        ? 'border-cyan-400 bg-cyan-400/10' 
                        : 'border-white/20 hover:border-white/40 bg-white/5'
                      }
                    `}
                  >
                    <div className={`w-12 h-8 rounded ${theme.preview} mb-2 border border-white/20`} />
                    <span className="text-sm text-white/80">{theme.name}</span>
                    {selectedTheme === theme.id && (
                      <Sparkles className="h-4 w-4 text-cyan-400 absolute -top-1 -right-1" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Layout className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-white">Live Preview</span>
            </div>
            <p className="text-xs text-white/60">
              Theme changes are applied instantly to the preview on the right.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Live Preview</h2>
          <p className="text-white/60">This is how your profile will look to visitors</p>
        </div>

        {/* Mobile Preview Frame */}
        <div className="relative">
          <div className="w-full max-w-sm mx-auto bg-black/80 rounded-3xl p-1 shadow-2xl shadow-cyan-500/20 border border-white/10 backdrop-blur-md">
            <div className={`${getThemeStyles(selectedTheme)} rounded-[20px] p-6 min-h-[600px] backdrop-blur-sm border border-white/5 transition-all duration-500`}>
              
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

        {!profile.is_public && (
          <Card className="bg-amber-500/10 border-amber-400/30 backdrop-blur-md">
            <CardContent className="p-4 text-center">
              <p className="text-amber-300 text-sm font-medium">⚠️ Profile is Private</p>
              <p className="text-amber-400/80 text-xs mt-1">
                Enable "Public Profile" in settings to make it accessible to others
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
