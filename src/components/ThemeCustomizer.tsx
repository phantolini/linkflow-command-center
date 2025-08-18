
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Palette, Layout, Sparkles } from "lucide-react";
import { api, Profile } from "@/services/api";

interface ThemeCustomizerProps {
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

export const ThemeCustomizer = ({ profile, onProfileUpdate }: ThemeCustomizerProps) => {
  const [selectedTheme, setSelectedTheme] = useState(profile.theme);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateTheme = async (themeId: string) => {
    setIsUpdating(true);
    try {
      const updatedProfile = await api.updateProfile(profile.id, {
        theme: themeId
      });
      
      onProfileUpdate(updatedProfile);
      setSelectedTheme(themeId);
      
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
    } finally {
      setIsUpdating(false);
    }
  };

  return (
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
            <span className="text-sm font-medium text-white">Preview</span>
          </div>
          <p className="text-xs text-white/60">
            Your theme changes will be reflected on your public profile page immediately.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
