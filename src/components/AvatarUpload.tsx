
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, User } from "lucide-react";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarUpdate: (url: string) => void;
  userId: string;
}

export const AvatarUpload = ({ currentAvatarUrl, onAvatarUpdate, userId }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      
      // Create a mock URL for now - in your platform, you'd upload to your storage
      const mockUrl = URL.createObjectURL(file);
      
      onAvatarUpdate(mockUrl);
      
      toast({
        title: "Avatar updated!",
        description: "Your profile picture has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading avatar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-cyan-400/20 to-purple-600/20 border border-white/10 backdrop-blur-md flex items-center justify-center">
          {currentAvatarUrl ? (
            <img
              src={currentAvatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-white/60" />
          )}
        </div>
        
        <Button
          size="sm"
          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 border border-white/20"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={uploadAvatar}
        className="hidden"
      />
      
      <p className="text-xs text-white/60 text-center">
        Click the upload button to change your avatar
        <br />
        <span className="text-white/40">Max 2MB • JPG, PNG, WebP</span>
      </p>
    </div>
  );
};
