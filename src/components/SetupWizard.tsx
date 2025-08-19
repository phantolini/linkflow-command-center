
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, ArrowRight, CheckCircle } from "lucide-react";
import { AvatarUpload } from "./AvatarUpload";
import { api, Profile } from "@/services/api";

interface SetupWizardProps {
  user: any;
  onComplete: (profile: Profile) => void;
}

export const SetupWizard = ({ user, onComplete }: SetupWizardProps) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    username: '',
    display_name: user?.displayName || '',
    bio: '',
    avatar_url: user?.photoURL || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (!profile.username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const newProfile = await api.createProfile({
        ...profile,
        user_id: user.uid,
        theme: 'cyber',
        is_public: true,
      });
      
      toast({
        title: "Profile created!",
        description: "Your profile has been set up successfully.",
      });
      
      onComplete(newProfile);
    } catch (error: any) {
      toast({
        title: "Error creating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  stepNum <= step
                    ? 'bg-cyan-400 border-cyan-400 text-black'
                    : 'border-white/20 text-white/60'
                }`}
              >
                {stepNum < step ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  stepNum
                )}
              </div>
              {stepNum < 3 && (
                <div
                  className={`w-16 h-1 mx-2 transition-all ${
                    stepNum < step ? 'bg-cyan-400' : 'bg-white/20'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              {step === 1 && "Welcome to SAWD LINK"}
              {step === 2 && "Customize Your Profile"}
              {step === 3 && "You're All Set!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-purple-600/20 rounded-full mx-auto mb-4 flex items-center justify-center border border-white/10">
                    <User className="h-8 w-8 text-cyan-400" />
                  </div>
                  <p className="text-white/80">
                    Let's create your digital command center. Start by choosing a unique username.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username" className="text-white/80">Username</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => updateProfile('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="your-username"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-cyan-400/20"
                    />
                    <p className="text-xs text-white/60 mt-1">
                      Your username will be part of your public link: sawd.link/{profile.username || 'your-username'}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="display_name" className="text-white/80">Display Name</Label>
                    <Input
                      id="display_name"
                      value={profile.display_name}
                      onChange={(e) => updateProfile('display_name', e.target.value)}
                      placeholder="Your Display Name"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-cyan-400/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <AvatarUpload
                    currentAvatarUrl={profile.avatar_url}
                    onAvatarUpdate={(url) => updateProfile('avatar_url', url)}
                    userId={user.uid}
                  />
                </div>

                <div>
                  <Label htmlFor="bio" className="text-white/80">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => updateProfile('bio', e.target.value)}
                    placeholder="Tell people about yourself..."
                    rows={4}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-cyan-400/20 resize-none"
                  />
                  <p className="text-xs text-white/60 mt-1">
                    {profile.bio.length}/160 characters
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-full mx-auto flex items-center justify-center border border-green-400/30">
                  <CheckCircle className="h-10 w-10 text-green-400" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Welcome aboard, {profile.display_name || profile.username}!
                  </h3>
                  <p className="text-white/80">
                    Your profile has been created successfully. You can now start adding your links and customizing your page.
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-white/70">
                    Your profile will be available at:
                  </p>
                  <p className="text-cyan-400 font-medium">
                    sawd.link/{profile.username}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={step === 1}
                className="border-white/20 text-white/80 hover:bg-white/10"
              >
                Previous
              </Button>

              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={step === 1 && !profile.username.trim()}
                  className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 border border-white/10"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border border-white/10"
                >
                  {isLoading ? "Creating..." : "Get Started"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
