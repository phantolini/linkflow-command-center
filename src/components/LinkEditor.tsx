
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, GripVertical, ExternalLink, Trash2, Save } from "lucide-react";
import { ProfileSettings } from "./ProfileSettings";

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
  onProfileUpdate,
  userId
}: { 
  profile: Profile; 
  onProfileUpdate: (profile: Profile) => void;
  userId: string;
}) => {
  const [links, setLinks] = useState<Link[]>([]);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile Settings */}
      <div className="lg:col-span-1">
        <ProfileSettings 
          profile={profile}
          onProfileUpdate={onProfileUpdate}
          userId={userId}
        />
      </div>

      {/* Links Management */}
      <div className="lg:col-span-2">
        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Links</CardTitle>
              <Button
                onClick={addLink}
                size="sm"
                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 border border-white/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {links.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <ExternalLink className="h-8 w-8 text-white/60" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No links yet</h3>
                <p className="text-white/60 mb-4">Add your first link to get started</p>
                <Button
                  onClick={addLink}
                  className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 border border-white/10"
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
    <Card className="bg-white/5 border-white/10 hover:border-cyan-400/30 transition-all duration-200 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <GripVertical className="h-4 w-4 text-white/40 cursor-grab" />
          
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={editingLink.title}
                  onChange={(e) => setEditingLink(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-cyan-400/20"
                  placeholder="Link title"
                />
                <Input
                  value={editingLink.url}
                  onChange={(e) => setEditingLink(prev => ({ ...prev, url: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-cyan-400/20"
                  placeholder="https://example.com"
                />
                <Input
                  value={editingLink.description || ''}
                  onChange={(e) => setEditingLink(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-cyan-400/20"
                  placeholder="Optional description"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700 border border-white/10">
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel} className="border-white/20 text-white/80 hover:bg-white/10">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => setIsEditing(true)}>
                  <h4 className="font-medium text-white hover:text-cyan-400 transition-colors">
                    {link.title}
                  </h4>
                  <p className="text-sm text-white/60 truncate">{link.url}</p>
                  {link.description && (
                    <p className="text-xs text-white/50 mt-1">{link.description}</p>
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
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
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
