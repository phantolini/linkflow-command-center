
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Eye, MousePointer } from "lucide-react";
import { api, Profile, Link } from "@/services/api";

interface LinkAnalytics extends Link {
  clicks: number;
}

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  topLinks: LinkAnalytics[];
  recentActivity: any[];
}

export const AnalyticsDashboard = ({ profile }: { profile: Profile }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalClicks: 0,
    topLinks: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [profile.id]);

  const loadAnalytics = async () => {
    try {
      // Get profile analytics
      const analyticsData = await api.getProfileAnalytics(profile.id);
      const links = await api.getLinks(profile.id);
      
      // Create analytics with click data
      const topLinks: LinkAnalytics[] = links.map(link => ({
        ...link,
        clicks: Math.floor(Math.random() * 50) // Mock click data
      })).sort((a, b) => b.clicks - a.clicks);

      setAnalytics({
        totalViews: analyticsData.views,
        totalClicks: analyticsData.clicks,
        topLinks: topLinks.slice(0, 5),
        recentActivity: []
      });
    } catch (error: any) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-black/40 border-slate-700/50 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-slate-600 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Views"
          value={analytics.totalViews}
          icon={Eye}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Total Clicks"
          value={analytics.totalClicks}
          icon={MousePointer}
          trend="+8%"
          trendUp={true}
        />
        <StatCard
          title="Active Links"
          value={analytics.topLinks.filter(l => l.is_active).length}
          icon={BarChart3}
          trend=""
          trendUp={true}
        />
        <StatCard
          title="Click Rate"
          value={analytics.totalViews > 0 ? `${Math.round((analytics.totalClicks / analytics.totalViews) * 100)}%` : '0%'}
          icon={TrendingUp}
          trend="+5%"
          trendUp={true}
        />
      </div>

      {/* Top Links */}
      <Card className="bg-black/40 border-slate-700/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            Top Performing Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.topLinks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-400 text-sm">No link data yet</p>
              <p className="text-slate-500 text-xs mt-1">Analytics will appear once people start clicking your links</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.topLinks.map((link, index) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-cyan-400">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{link.title}</h4>
                      <p className="text-sm text-slate-400 truncate max-w-xs">
                        {link.url}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                    >
                      {link.clicks} clicks
                    </Badge>
                    {!link.is_active && (
                      <Badge variant="outline" className="text-slate-500 border-slate-600">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Notice */}
      {!profile.is_public && (
        <Card className="bg-amber-500/10 border-amber-500/30 backdrop-blur-md">
          <CardContent className="p-4 text-center">
            <p className="text-amber-300 text-sm font-medium">⚠️ Analytics Limited</p>
            <p className="text-amber-400/80 text-xs mt-1">
              Make your profile public to start collecting detailed analytics data
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp
}: {
  title: string;
  value: string | number;
  icon: any;
  trend: string;
  trendUp: boolean;
}) => (
  <Card className="bg-black/40 border-slate-700/50 backdrop-blur-md hover:border-cyan-500/30 transition-all duration-200">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
              {trend} from last week
            </p>
          )}
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6 text-cyan-400" />
        </div>
      </div>
    </CardContent>
  </Card>
);
