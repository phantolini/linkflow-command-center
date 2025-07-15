
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Download, Share, Copy } from "lucide-react";
import QRCodeLib from 'qrcode';

interface Profile {
  username: string;
  is_public: boolean;
}

interface QRCodeGeneratorProps {
  profile: Profile;
}

export const QRCodeGenerator = ({ profile }: QRCodeGeneratorProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [profileUrl, setProfileUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateQRCode = async () => {
    if (!profile.is_public) {
      toast({
        title: "Profile not public",
        description: "Make your profile public to generate a QR code.",
        variant: "destructive",
      });
      return;
    }

    const baseUrl = window.location.origin;
    const url = `${baseUrl}/${profile.username}`;
    setProfileUrl(url);
    
    setIsGenerating(true);
    try {
      const qrDataUrl = await QRCodeLib.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#ffffff',
          light: '#000000'
        },
        errorCorrectionLevel: 'M'
      });
      setQrCodeUrl(qrDataUrl);
      
      toast({
        title: "QR Code Generated",
        description: "Your QR code has been generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error generating QR code",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `${profile.username}-qr-code.png`;
    link.href = qrCodeUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code Downloaded",
      description: "Your QR code has been saved to your downloads.",
    });
  };

  const copyProfileUrl = async () => {
    const url = profileUrl || `${window.location.origin}/${profile.username}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "URL Copied",
        description: "Profile URL has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error copying URL",
        description: "Failed to copy URL to clipboard.",
        variant: "destructive",
      });
    }
  };

  const shareProfile = async () => {
    const url = profileUrl || `${window.location.origin}/${profile.username}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.username}'s Profile`,
          text: `Check out my profile!`,
          url: url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      copyProfileUrl();
    }
  };

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <QrCode className="h-5 w-5 text-cyan-400" />
          QR Code Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-white/80 mb-4">
            Generate a QR code for your profile to share easily
          </p>
          
          <Button
            onClick={generateQRCode}
            disabled={isGenerating || !profile.is_public}
            className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 mb-6"
          >
            <QrCode className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate QR Code"}
          </Button>

          {!profile.is_public && (
            <div className="p-4 bg-amber-500/10 border border-amber-400/30 rounded-lg backdrop-blur-sm mb-6">
              <p className="text-amber-300 text-sm font-medium">⚠️ Profile Not Public</p>
              <p className="text-amber-400/80 text-xs mt-1">
                Enable "Public Profile" in your profile settings to generate a QR code.
              </p>
            </div>
          )}
        </div>

        {profileUrl && (
          <div className="space-y-2">
            <Label className="text-white/80">Profile URL</Label>
            <div className="flex gap-2">
              <Input
                value={profileUrl}
                readOnly
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-cyan-400/20"
              />
              <Button
                onClick={copyProfileUrl}
                size="sm"
                variant="outline"
                className="border-white/20 text-white/80 hover:bg-white/10"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {qrCodeUrl && (
          <>
            <div className="text-center">
              <div className="w-64 h-64 mx-auto bg-white p-4 rounded-lg">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={downloadQRCode}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={shareProfile}
                variant="outline"
                className="flex-1 border-white/20 text-white/80 hover:bg-white/10"
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            <div className="p-3 bg-cyan-500/10 border border-cyan-400/30 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-cyan-300 font-medium">✨ Share Your Profile</p>
              <p className="text-xs text-cyan-400">
                Anyone can scan this QR code to visit your profile instantly!
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
