
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "../ProfileSettings";
import { ThemeCustomizer } from "../ThemeCustomizer";
import { AnalyticsDashboard } from "../AnalyticsDashboard";
import { ProfilePreview } from "../ProfilePreview";
import { LinkEditor } from "../LinkEditor";
import { User, Link, Palette, BarChart3, Eye, Settings } from "lucide-react";
import { Profile } from "@/services/api";

interface DashboardContentProps {
  profile: Profile;
  userId: string;
  onProfileUpdate: (profile: Profile) => void;
}

export const DashboardContent = ({ profile, userId, onProfileUpdate }: DashboardContentProps) => {
  const [activeTab, setActiveTab] = useState("editor");

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-5 bg-black/40 border border-white/10 backdrop-blur-md">
          <TabsTrigger 
            value="editor" 
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-white/60"
          >
            <Link className="h-4 w-4 mr-2" />
            Links
          </TabsTrigger>
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-white/60"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="theme" 
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-white/60"
          >
            <Palette className="h-4 w-4 mr-2" />
            Theme
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-white/60"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="preview" 
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-white/60"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TabsContent value="editor" className="mt-0">
              <LinkEditor 
                profile={profile} 
                onProfileUpdate={onProfileUpdate}
                userId={userId}
              />
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <ProfileSettings 
                profile={profile} 
                onProfileUpdate={onProfileUpdate}
                userId={userId}
              />
            </TabsContent>

            <TabsContent value="theme" className="mt-0">
              <ThemeCustomizer 
                profile={profile} 
                onProfileUpdate={onProfileUpdate}
              />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <AnalyticsDashboard profile={profile} />
            </TabsContent>

            <TabsContent value="preview" className="mt-0 lg:hidden">
              <ProfilePreview profile={profile} />
            </TabsContent>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-8">
              <ProfilePreview profile={profile} />
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
};
