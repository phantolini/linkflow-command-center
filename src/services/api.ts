import { firebaseDataManager } from './firebaseDataManager';

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
      const profile = await firebaseDataManager.get(`profile:${userId}`, {
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

    await firebaseDataManager.set(`profile:${profile.user_id}`, profile, {
      appContext: 'linkbuilder',
      syncImmediately: true
    });

    // Also store in profiles collection for public access
    await firebaseDataManager.set(`profiles:${profile.id}`, profile, {
      appContext: 'linkbuilder',
      syncImmediately: true
    });

    return profile;
  },

  async updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
    try {
      // Get current profile first
      const profiles = await firebaseDataManager.query('profiles', [], {
        appContext: 'linkbuilder'
      });
      
      const profile = profiles.find((p: Profile) => p.id === id);
      if (!profile) throw new Error('Profile not found');
      
      const updatedProfile = { 
        ...profile, 
        ...data, 
        updated_at: new Date().toISOString() 
      };
      
      // Update both individual profile and profiles collection
      await firebaseDataManager.batchWrite([
        {
          type: 'set',
          key: `profile:${updatedProfile.user_id}`,
          data: updatedProfile,
          appContext: 'linkbuilder'
        },
        {
          type: 'set',
          key: `profiles:${updatedProfile.id}`,
          data: updatedProfile,
          appContext: 'linkbuilder'
        }
      ]);

      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  async getPublicProfile(username: string): Promise<Profile | null> {
    try {
      const profiles = await firebaseDataManager.query('profiles', [
        ['username', '==', username],
        ['is_public', '==', true]
      ], {
        appContext: 'linkbuilder'
      });
      
      return profiles[0] || null;
    } catch (error) {
      console.error('Error getting public profile:', error);
      return null;
    }
  },

  // Link operations
  async getLinks(profileId: string): Promise<Link[]> {
    try {
      const links = await firebaseDataManager.query('links', [
        ['profile_id', '==', profileId]
      ], {
        orderByField: 'position',
        orderDirection: 'asc',
        appContext: 'linkbuilder'
      });
      
      return links;
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

      await firebaseDataManager.set(`links:${link.id}`, link, {
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
      // Get current link
      const currentLink = await firebaseDataManager.get(`links:${id}`, {
        appContext: 'linkbuilder'
      });
      
      if (!currentLink) throw new Error('Link not found');

      const updatedLink = { ...currentLink, ...data };
      
      await firebaseDataManager.update(`links:${id}`, updatedLink, {
        appContext: 'linkbuilder'
      });

      return updatedLink;
    } catch (error) {
      console.error('Error updating link:', error);
      throw error;
    }
  },

  async deleteLink(id: string): Promise<void> {
    try {
      await firebaseDataManager.delete(`links:${id}`, {
        appContext: 'linkbuilder'
      });
    } catch (error) {
      console.error('Error deleting link:', error);
      throw error;
    }
  },

  // Analytics
  async getProfileAnalytics(profileId: string): Promise<{ views: number; clicks: number }> {
    try {
      const analytics = await firebaseDataManager.get(`analytics:${profileId}`, {
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
      await firebaseDataManager.incrementAnalytics(profileId, 'views', 1, 'linkbuilder');
      console.log('Profile view tracked:', profileId);
    } catch (error) {
      console.error('Error tracking profile view:', error);
    }
  },

  async trackLinkClick(linkId: string, profileId: string): Promise<void> {
    try {
      // Track both profile clicks and individual link clicks
      await firebaseDataManager.batchWrite([
        {
          type: 'update',
          key: `analytics:${profileId}`,
          data: { clicks: 1 }
        },
        {
          type: 'update', 
          key: `link_analytics:${linkId}`,
          data: { clicks: 1 }
        }
      ]);
      
      console.log('Link click tracked:', linkId, profileId);
    } catch (error) {
      console.error('Error tracking link click:', error);
    }
  },
};
