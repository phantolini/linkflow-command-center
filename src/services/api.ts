import { dataSyncManager } from './dataSyncManager';

// Keep existing interfaces
export interface Profile {
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

export interface Link {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  description: string | null;
  position: number;
  is_active: boolean;
}

// Generate unique IDs
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

export const api = {
  // Profile operations
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const profile = await dataSyncManager.get(`profile:${userId}`, {
        appContext: 'linkbuilder'
      });
      return profile;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  },

  async createProfile(data: Partial<Profile>): Promise<Profile> {
    const profile: Profile = {
      id: generateId(),
      user_id: data.user_id!,
      username: data.username!,
      display_name: data.display_name!,
      bio: data.bio || '',
      avatar_url: data.avatar_url || null,
      theme: data.theme || 'cyber',
      is_public: data.is_public || true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await dataSyncManager.set(`profile:${profile.user_id}`, profile, {
      appContext: 'linkbuilder',
      syncImmediately: true
    });

    return profile;
  },

  async updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
    try {
      // Get current profile first
      const profiles = await dataSyncManager.get('profiles', {
        appContext: 'linkbuilder',
        fallbackToCache: true
      }) || [];
      
      const profileIndex = profiles.findIndex((p: Profile) => p.id === id);
      if (profileIndex === -1) throw new Error('Profile not found');
      
      const updatedProfile = { 
        ...profiles[profileIndex], 
        ...data, 
        updated_at: new Date().toISOString() 
      };
      
      // Update in profiles array
      profiles[profileIndex] = updatedProfile;
      await dataSyncManager.set('profiles', profiles, {
        appContext: 'linkbuilder',
        syncImmediately: true
      });

      // Also update the individual profile key
      await dataSyncManager.set(`profile:${updatedProfile.user_id}`, updatedProfile, {
        appContext: 'linkbuilder',
        syncImmediately: true
      });

      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  async getPublicProfile(username: string): Promise<Profile | null> {
    try {
      const profiles = await dataSyncManager.get('profiles', {
        appContext: 'linkbuilder',
        fallbackToCache: true
      }) || [];
      
      const profile = profiles.find((p: Profile) => p.username === username && p.is_public);
      return profile || null;
    } catch (error) {
      console.error('Error getting public profile:', error);
      return null;
    }
  },

  // Link operations
  async getLinks(profileId: string): Promise<Link[]> {
    try {
      const links = await dataSyncManager.get(`links:${profileId}`, {
        appContext: 'linkbuilder',
        fallbackToCache: true
      }) || [];
      
      return links.sort((a: Link, b: Link) => a.position - b.position);
    } catch (error) {
      console.error('Error getting links:', error);
      return [];
    }
  },

  async createLink(data: Partial<Link>): Promise<Link> {
    try {
      const link: Link = {
        id: generateId(),
        profile_id: data.profile_id!,
        title: data.title!,
        url: data.url!,
        description: data.description || null,
        position: data.position || 0,
        is_active: data.is_active !== false,
      };

      // Get existing links
      const existingLinks = await this.getLinks(link.profile_id);
      const updatedLinks = [...existingLinks, link];

      await dataSyncManager.set(`links:${link.profile_id}`, updatedLinks, {
        appContext: 'linkbuilder',
        syncImmediately: true
      });

      return link;
    } catch (error) {
      console.error('Error creating link:', error);
      throw error;
    }
  },

  async updateLink(id: string, data: Partial<Link>): Promise<Link> {
    try {
      // Find which profile this link belongs to
      let targetProfileId = '';
      let links: Link[] = [];
      
      // If we have profile_id in the update data, use it
      if (data.profile_id) {
        targetProfileId = data.profile_id;
        links = await this.getLinks(targetProfileId);
      } else {
        // Search through profiles to find this link
        const profiles = await dataSyncManager.get('profiles', {
          appContext: 'linkbuilder',
          fallbackToCache: true
        }) || [];
        
        for (const profile of profiles) {
          const profileLinks = await this.getLinks(profile.id);
          const found = profileLinks.find(l => l.id === id);
          if (found) {
            targetProfileId = profile.id;
            links = profileLinks;
            break;
          }
        }
      }

      const linkIndex = links.findIndex(l => l.id === id);
      if (linkIndex === -1) throw new Error('Link not found');

      const updatedLink = { ...links[linkIndex], ...data };
      links[linkIndex] = updatedLink;

      await dataSyncManager.set(`links:${targetProfileId}`, links, {
        appContext: 'linkbuilder',
        syncImmediately: true
      });

      return updatedLink;
    } catch (error) {
      console.error('Error updating link:', error);
      throw error;
    }
  },

  async deleteLink(id: string): Promise<void> {
    try {
      // Search through profiles to find this link
      const profiles = await dataSyncManager.get('profiles', {
        appContext: 'linkbuilder',
        fallbackToCache: true
      }) || [];
      
      for (const profile of profiles) {
        const links = await this.getLinks(profile.id);
        const linkIndex = links.findIndex(l => l.id === id);
        
        if (linkIndex !== -1) {
          links.splice(linkIndex, 1);
          await dataSyncManager.set(`links:${profile.id}`, links, {
            appContext: 'linkbuilder',
            syncImmediately: true
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      throw error;
    }
  },

  // Analytics
  async getProfileAnalytics(profileId: string): Promise<{ views: number; clicks: number }> {
    try {
      const analytics = await dataSyncManager.get(`analytics:${profileId}`, {
        appContext: 'linkbuilder',
        fallbackToCache: true
      });
      
      return analytics || {
        views: Math.floor(Math.random() * 1000) + 100,
        clicks: Math.floor(Math.random() * 500) + 50,
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return { views: 0, clicks: 0 };
    }
  },

  async trackProfileView(profileId: string): Promise<void> {
    try {
      const analytics = await this.getProfileAnalytics(profileId);
      analytics.views += 1;
      
      await dataSyncManager.set(`analytics:${profileId}`, analytics, {
        appContext: 'linkbuilder',
        syncImmediately: false // Don't sync immediately for analytics
      });
      
      console.log('Profile view tracked:', profileId);
    } catch (error) {
      console.error('Error tracking profile view:', error);
    }
  },

  async trackLinkClick(linkId: string, profileId: string): Promise<void> {
    try {
      const analytics = await this.getProfileAnalytics(profileId);
      analytics.clicks += 1;
      
      await dataSyncManager.set(`analytics:${profileId}`, analytics, {
        appContext: 'linkbuilder',
        syncImmediately: false
      });
      
      // Also track individual link clicks
      const linkAnalytics = await dataSyncManager.get(`link_analytics:${linkId}`, {
        appContext: 'linkbuilder',
        fallbackToCache: true
      }) || { clicks: 0 };
      
      linkAnalytics.clicks += 1;
      
      await dataSyncManager.set(`link_analytics:${linkId}`, linkAnalytics, {
        appContext: 'linkbuilder',
        syncImmediately: false
      });
      
      console.log('Link click tracked:', linkId, profileId);
    } catch (error) {
      console.error('Error tracking link click:', error);
    }
  },
};
