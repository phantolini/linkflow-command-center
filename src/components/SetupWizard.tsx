import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { User, Upload, Link as LinkIcon, Eye } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  theme: string;
  is_public: boolean;
}

interface SetupWizardProps {
  profile: Profile;
  onComplete: (updatedProfile: Profile) => void;
}

export const SetupWizard = ({ profile, onComplete }: SetupWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    username: profile.username || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { updateProfile } = useProfile();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 2MB",
          variant: "destructive",
        });
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return null;

    try {
      // Convert file to base64 for storage in DataSyncManager
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(avatarFile);
      });
    } catch (error: any) {
      console.error('Error processing avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to process profile picture",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleNext = async () => {
    setIsLoading(true);
    
    try {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final step - save everything and publish
        let avatarUrl = profile.avatar_url;
        
        if (avatarFile) {
          avatarUrl = await uploadAvatar();
        }

        await updateProfile({
          display_name: formData.display_name,
          bio: formData.bio,
          username: formData.username,
          avatar_url: avatarUrl,
          is_public: true,
        });

        toast({
          title: "Profile published! 🎉",
          description: `Your profile is now live at /${formData.username}`,
        });

        onComplete({
          ...profile,
          display_name: formData.display_name,
          bio: formData.bio,
          username: formData.username,
          avatar_url: avatarUrl,
          is_public: true,
          updated_at: new Date().toISOString()
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.display_name.trim() && formData.username.trim();
      case 2:
        return true; // Bio is optional
      case 3:
        return true; // Avatar is optional
      case 4:
        return true; // Preview step
      default:
        return false;
    }
  };

  return (
    <Card className="bg-black/40 border-slate-700/50 backdrop-blur-md max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-white">Setup Your Profile</CardTitle>
          <span className="text-sm text-slate-400">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 mb-4">
              <User className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300">Display Name *</Label>
              <Input
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                className="bg-slate-800/50 border-slate-600 text-white"
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Username *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  /{' '}
                </span>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                  className="bg-slate-800/50 border-slate-600 text-white pl-8"
                  placeholder="username"
                />
              </div>
              <p className="text-xs text-slate-400">
                Your profile will be available at: /{formData.username}
              </p>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 mb-4">
              <LinkIcon className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Tell Your Story</h3>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300">Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="bg-slate-800/50 border-slate-600 text-white resize-none"
                placeholder="Tell people about yourself..."
                rows={4}
              />
              <p className="text-xs text-slate-400">
                This will appear under your name on your profile
              </p>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 mb-4">
              <Upload className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Profile Picture</h3>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {formData.display_name.charAt(0).toUpperCase() || '?'}
                  </span>
                )}
              </div>
              
              <Label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg cursor-pointer transition-colors">
                <Upload className="h-4 w-4" />
                Upload Photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </Label>
              
              <p className="text-xs text-slate-400 mt-2">
                JPEG, PNG or WebP. Max 2MB.
              </p>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 mb-4">
              <Eye className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Preview & Publish</h3>
            </div>
            
            <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700/50">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {formData.display_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                <h4 className="text-xl font-bold text-white mb-2">
                  {formData.display_name}
                </h4>
                
                {formData.bio && (
                  <p className="text-slate-300 text-sm mb-4">
                    {formData.bio}
                  </p>
                )}
                
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full text-sm">
                  @{formData.username}
                </div>
              </div>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-300 text-sm font-medium">
                Ready to publish! Your profile will be available at:
              </p>
              <p className="text-green-400 font-mono text-sm mt-1">
                {window.location.origin}/{formData.username}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isLoading}
            className="border-slate-600 text-slate-300"
          >
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
          >
            {isLoading ? "Processing..." : currentStep === totalSteps ? "Publish Profile" : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
