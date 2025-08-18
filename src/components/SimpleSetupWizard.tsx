
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, User, Type, FileText } from "lucide-react";

interface SimpleSetupWizardProps {
  onComplete: () => void;
}

export const SimpleSetupWizard = ({ onComplete }: SimpleSetupWizardProps) => {
  const { user } = useAuth();
  const { createProfile } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    display_name: user?.display_name || '',
    bio: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await createProfile({
        username: formData.username,
        display_name: formData.display_name,
        bio: formData.bio,
        theme: 'default',
        is_public: true,
      });

      toast({
        title: "Profile created!",
        description: "Your SAWD LINK profile is ready to go.",
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/40 border-white/10 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white mb-2">
            Set Up Your Profile
          </CardTitle>
          <p className="text-slate-300">Create your personalized link page</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <User className="h-4 w-4 text-cyan-400" />
                Username
              </label>
              <Input
                type="text"
                placeholder="your-username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
                className="bg-black/20 border-white/20 text-white placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-400">
                This will be your public URL: /your-username
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <Type className="h-4 w-4 text-cyan-400" />
                Display Name
              </label>
              <Input
                type="text"
                placeholder="Your Name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                required
                className="bg-black/20 border-white/20 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                Bio (optional)
              </label>
              <Textarea
                placeholder="Tell people about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="bg-black/20 border-white/20 text-white placeholder:text-slate-400 resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !formData.username || !formData.display_name}
              className="w-full h-12 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold"
            >
              {loading ? "Creating..." : "Create Profile"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
