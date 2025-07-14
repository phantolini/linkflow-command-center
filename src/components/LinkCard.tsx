
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { getSocialIcon, getSocialColor } from "@/utils/socialIcons";

interface LinkCardProps {
  title: string;
  url: string;
  description?: string;
  onClick?: () => void;
}

export const LinkCard = ({ title, url, description, onClick }: LinkCardProps) => {
  const IconComponent = getSocialIcon(url);
  const colorClass = getSocialColor(url);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
  };

  return (
    <Card 
      className="bg-black/20 border-slate-700/30 backdrop-blur-sm hover:border-fuchsia-500/50 transition-all duration-300 cursor-pointer group hover:bg-black/30 glass-card"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${colorClass} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white group-hover:text-fuchsia-400 transition-colors duration-300 truncate">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-slate-400 truncate mt-1">
                {description}
              </p>
            )}
          </div>
          <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-fuchsia-400 transition-colors duration-300 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};
