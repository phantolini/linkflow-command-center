
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, GripVertical, ExternalLink, Trash2, Save, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export const LinkEditor = ({ 
  profile, 
  onProfileUpdate 
}: { 
  profile: Profile; 
  onProfileUpdate: (profile: Profile) => void;
}) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [editingProfile, setEditingProfile] = useState(profile);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadLinks();
  }, [profile.id]);

  useEffect(() => {
    // Autosave profile changes with debounce
    const timeoutId = setTimeout(() => {
      if (JSON.stringify(editingProfile) !== JSON.stringify(profile)) {
        saveProfile();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [editingProfile]);

  const loadLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', profile.id)
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

  const saveProfile = async () => {
    setIsAutosaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: editingProfile.username,
          display_name: editingProfile.display_name,
          bio: editingProfile.bio,
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

  const addLink = async () => {
    try {
      const newPosition = Math.max(...links.map(l => l.position), 0) + 1;
      
      const { data, error } = await supabase
        .from('links')
        .insert({
          profile_id: profile.id,
          title: 'New Link',
          url: 'https://example.com',
          description: '',
          position: newPosition,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      setLinks([...links, data]);
    } catch (error: any) {
      toast({
        title: "Error adding link",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateLink = async (linkId: string, updates: Partial<Link>) => {
    try {
      const { data, error } = await supabase
        .from('links')
        .update(updates)
        .eq('id', linkId)
        .select()
        .single();

      if (error) throw error;
      
      setLinks(links.map(link => 
        link.id === linkId ? { ...link, ...data } : link
      ));
    } catch (error: any) {
      toast({
        title: "Error updating link",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;
      
      setLinks(links.filter(link => link.id !== linkId));
    } catch (error: any) {
      toast({
        title: "Error deleting link",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleProfileChange = (field: keyof Profile, value: any) => {
    setEditingProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile Settings */}
      <div className="lg:col-span-1">
        <Card className="bg-black/40 border-slate-700/50 backdrop-blur-md">
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Username</Label>
              <Input
                value={editingProfile.username}
                onChange={(e) => handleProfileChange('username', e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-white"
                placeholder="your-username"
              />
              <p className="text-xs text-slate-400">
                Your public URL: /{editingProfile.username}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Display Name</Label>
              <Input
                value={editingProfile.display_name}
                onChange={(e) => handleProfileChange('display_name', e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-white"
                placeholder="Your Name"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Bio</Label>
              <Textarea
                value={editingProfile.bio || ''}
                onChange={(e) => handleProfileChange('bio', e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-white resize-none"
                placeholder="Tell the world about yourself..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <div>
                <Label className="text-slate-300">Public Profile</Label>
                <p className="text-xs text-slate-400">Make your profile visible to everyone</p>
              </div>
              <Switch
                checked={editingProfile.is_public}
                onCheckedChange={(checked) => handleProfileChange('is_public', checked)}
              />
            </div>

            {editingProfile.is_public && (
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <p className="text-sm text-cyan-300 font-medium">✨ Your profile is live!</p>
                <p className="text-xs text-cyan-400">
                  Share: /{editingProfile.username}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Links Management */}
      <div className="lg:col-span-2">
        <Card className="bg-black/40 border-slate-700/50 backdrop-blur-md">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Links</CardTitle>
              <Button
                onClick={addLink}
                size="sm"
                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {links.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No links yet</h3>
                <p className="text-slate-400 mb-4">Add your first link to get started</p>
                <Button
                  onClick={addLink}
                  className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Link
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {links.map((link) => (
                  <LinkItem
                    key={link.id}
                    link={link}
                    onUpdate={updateLink}
                    onDelete={deleteLink}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const LinkItem = ({ 
  link, 
  onUpdate, 
  onDelete 
}: { 
  link: Link; 
  onUpdate: (id: string, updates: Partial<Link>) => void;
  onDelete: (id: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingLink, setEditingLink] = useState(link);

  const handleSave = () => {
    onUpdate(link.id, editingLink);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditingLink(link);
    setIsEditing(false);
  };

  return (
    <Card className="bg-slate-800/30 border-slate-600/50 hover:border-cyan-500/30 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <GripVertical className="h-4 w-4 text-slate-500 cursor-grab" />
          
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={editingLink.title}
                  onChange={(e) => setEditingLink(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600 text-white"
                  placeholder="Link title"
                />
                <Input
                  value={editingLink.url}
                  onChange={(e) => setEditingLink(prev => ({ ...prev, url: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600 text-white"
                  placeholder="https://example.com"
                />
                <Input
                  value={editingLink.description || ''}
                  onChange={(e) => setEditingLink(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600 text-white"
                  placeholder="Optional description"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1" onClick={() => setIsEditing(true)} className="cursor-pointer">
                  <h4 className="font-medium text-white hover:text-cyan-400 transition-colors">
                    {link.title}
                  </h4>
                  <p className="text-sm text-slate-400 truncate">{link.url}</p>
                  {link.description && (
                    <p className="text-xs text-slate-500 mt-1">{link.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={link.is_active}
                    onCheckedChange={(checked) => onUpdate(link.id, { is_active: checked })}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(link.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
