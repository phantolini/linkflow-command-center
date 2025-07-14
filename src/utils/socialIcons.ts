
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Youtube, 
  Github, 
  Globe,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

export const getSocialIcon = (url: string) => {
  const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.toLowerCase();
  
  // Social media platform mapping
  const iconMap: Record<string, any> = {
    'instagram.com': Instagram,
    'www.instagram.com': Instagram,
    'twitter.com': Twitter,
    'www.twitter.com': Twitter,
    'x.com': Twitter,
    'www.x.com': Twitter,
    'facebook.com': Facebook,
    'www.facebook.com': Facebook,
    'fb.com': Facebook,
    'linkedin.com': Linkedin,
    'www.linkedin.com': Linkedin,
    'youtube.com': Youtube,
    'www.youtube.com': Youtube,
    'youtu.be': Youtube,
    'github.com': Github,
    'www.github.com': Github,
    'tiktok.com': Globe, // TikTok icon not available in lucide
    'www.tiktok.com': Globe,
    'snapchat.com': Globe,
    'www.snapchat.com': Globe,
    'discord.com': Globe,
    'discord.gg': Globe,
    'telegram.org': Globe,
    't.me': Globe,
    'whatsapp.com': Phone,
    'wa.me': Phone,
    'pinterest.com': Globe,
    'www.pinterest.com': Globe,
    'reddit.com': Globe,
    'www.reddit.com': Globe,
    'twitch.tv': Globe,
    'www.twitch.tv': Globe,
    'spotify.com': Globe,
    'open.spotify.com': Globe,
  };

  // Check for email
  if (url.includes('mailto:') || url.includes('@')) {
    return Mail;
  }

  // Check for phone
  if (url.includes('tel:') || url.includes('phone')) {
    return Phone;
  }

  // Check for maps/location
  if (url.includes('maps.google.com') || url.includes('goo.gl/maps')) {
    return MapPin;
  }

  return iconMap[domain] || Globe;
};

export const getSocialColor = (url: string): string => {
  const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.toLowerCase();
  
  const colorMap: Record<string, string> = {
    'instagram.com': 'from-pink-500 to-orange-500',
    'www.instagram.com': 'from-pink-500 to-orange-500',
    'twitter.com': 'from-blue-400 to-blue-600',
    'www.twitter.com': 'from-blue-400 to-blue-600',
    'x.com': 'from-gray-800 to-black',
    'www.x.com': 'from-gray-800 to-black',
    'facebook.com': 'from-blue-600 to-blue-800',
    'www.facebook.com': 'from-blue-600 to-blue-800',
    'linkedin.com': 'from-blue-700 to-blue-900',
    'www.linkedin.com': 'from-blue-700 to-blue-900',
    'youtube.com': 'from-red-500 to-red-700',
    'www.youtube.com': 'from-red-500 to-red-700',
    'github.com': 'from-gray-700 to-gray-900',
    'www.github.com': 'from-gray-700 to-gray-900',
    'tiktok.com': 'from-pink-500 to-red-500',
    'www.tiktok.com': 'from-pink-500 to-red-500',
  };

  return colorMap[domain] || 'from-cyan-500 to-purple-500';
};
