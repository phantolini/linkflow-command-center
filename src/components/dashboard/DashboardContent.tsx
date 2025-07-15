
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinkEditor } from "../LinkEditor";
import { ProfilePreview } from "../ProfilePreview";
import { AnalyticsDashboard } from "../AnalyticsDashboard";
import { ThemeCustomizer } from "../ThemeCustomizer";
import { QRCodeGenerator } from "../QRCodeGenerator";
import { BarChart3, Edit, Eye, Palette, QrCode } from "lucide-react";

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

interface DashboardContentProps {
  profile: Profile;
  userId: string;
  onProfileUpdate: (profile: Profile) => void;
}

export const DashboardContent = ({ profile, userId, onProfileUpdate }: DashboardContentProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="editor" className="space-y-6">
        <TabsList className="bg-black/40 border border-white/10 backdrop-blur-md">
          <TabsTrigger value="editor" className="data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-white text-white/60">
            <Edit className="h-4 w-4 mr-2 text-fuchsia-400" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="customize" className="data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-white text-white/60">
            <Palette className="h-4 w-4 mr-2 text-fuchsia-400" />
            Customize
          </TabsTrigger>
          <TabsTrigger value="qr-code" className="data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-white text-white/60">
            <QrCode className="h-4 w-4 mr-2 text-fuchsia-400" />
            QR Code
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-white text-white/60">
            <Eye className="h-4 w-4 mr-2 text-fuchsia-400" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-white text-white/60">
            <BarChart3 className="h-4 w-4 mr-2 text-fuchsia-400" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <LinkEditor 
            profile={profile} 
            onProfileUpdate={onProfileUpdate}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="customize">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ThemeCustomizer 
              profile={profile}
              onProfileUpdate={onProfileUpdate}
            />
            <div className="space-y-6">
              <QRCodeGenerator profile={profile} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="qr-code">
          <div className="max-w-md mx-auto">
            <QRCodeGenerator profile={profile} />
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <ProfilePreview profile={profile} />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
