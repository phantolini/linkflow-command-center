
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AvatarUpload } from "./AvatarUpload";
import { Save, Check } from "lucide-react";

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

interface ProfileSettingsProps {
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
  userId: string;
}

export const ProfileSettings = ({ profile, onProfileUpdate, userId }: ProfileSettingsProps) => {
  const [editingProfile, setEditingProfile] = useState(profile);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setEditingProfile(profile);
  }, [profile]);

  useEffect(() => {
    // Autosave profile changes with debounce
    const timeoutId = setTimeout(() => {
      if (JSON.stringify(editingProfile) !== JSON.stringify(profile)) {
        saveProfile();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [editingProfile]);

  const saveProfile = async () => {
    setIsAutosaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: editingProfile.username,
          display_name: editingProfile.display_name,
          bio: editingProfile.bio,
          avatar_url: editingProfile.avatar_url,
          theme: editingProfile.theme,
          is_public: editingProfile.is_public,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      
      onProfileUpdate(data);
      setLastSaved(new Date());
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAutosaving(false);
    }
  };

  const handleProfileChange = (field: keyof Profile, value: any) => {
    setEditingProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpdate = (avatarUrl: string) => {
    handleProfileChange('avatar_url', avatarUrl);
  };

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            Profile Settings
          </CardTitle>
          <div className="flex items-center gap-2 text-xs">
            {isAutosaving ? (
              <div className="flex items-center gap-1 text-cyan-400">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                Saving...
              </div>
            ) : lastSaved ? (
              <div className="flex items-center gap-1 text-green-400">
                <Check className="w-3 h-3" />
                Saved
              </div>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <AvatarUpload
          currentAvatarUrl={editingProfile.avatar_url}
          onAvatarUpdate={handleAvatarUpdate}
          userId={userId}
        />

        <div className="space-y-2">
          <Label className="text-white/80">Username</Label>
          <Input
            value={editingProfile.username}
            onChange={(e) => handleProfileChange('username', e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-cyan-400/20"
            placeholder="your-username"
          />
          <p className="text-xs text-white/60">
            Your public URL: /{editingProfile.username}
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-white/80">Display Name</Label>
          <Input
            value={editingProfile.display_name}
            onChange={(e) => handleProfileChange('display_name', e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-cyan-400/20"
            placeholder="Your Name"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white/80">Bio</Label>
          <Textarea
            value={editingProfile.bio || ''}
            onChange={(e) => handleProfileChange('bio', e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-cyan-400/20 resize-none"
            placeholder="Tell the world about yourself..."
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
          <div>
            <Label className="text-white/80">Public Profile</Label>
            <p className="text-xs text-white/60">Make your profile visible to everyone</p>
          </div>
          <Switch
            checked={editingProfile.is_public}
            onCheckedChange={(checked) => handleProfileChange('is_public', checked)}
          />
        </div>

        {editingProfile.is_public && (
          <div className="p-3 bg-cyan-500/10 border border-cyan-400/30 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-cyan-300 font-medium">✨ Your profile is live!</p>
            <p className="text-xs text-cyan-400">
              Share: /{editingProfile.username}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
