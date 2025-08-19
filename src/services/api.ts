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
      const profile = await firebaseDataManager.get<Profile>('profiles', userId);
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

    await firebaseDataManager.create('profiles', profile.id, profile);

    return profile;
  },

  async updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
    try {
      const updatedProfile = await firebaseDataManager.update<Profile>('profiles', id, data);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  async getPublicProfile(username: string): Promise<Profile | null> {
    try {
      const profiles = await firebaseDataManager.getMany<Profile>('profiles', [
        { field: 'username', operator: '==', value: username },
        { field: 'is_public', operator: '==', value: true }
      ]);
      
      return profiles[0] || null;
    } catch (error) {
      console.error('Error getting public profile:', error);
      return null;
    }
  },

  // Link operations
  async getLinks(profileId: string): Promise<Link[]> {
    try {
      const links = await firebaseDataManager.getMany<Link>('links', [
        { field: 'profile_id', operator: '==', value: profileId }
      ], 'position');
      
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

      await firebaseDataManager.create('links', link.id, link);

      return link;
    } catch (error) {
      console.error('Error creating link:', error);
      throw error;
    }
  },

  async updateLink(id: string, data: Partial<Link>): Promise<Link> {
    try {
      const updatedLink = await firebaseDataManager.update<Link>('links', id, data);
      return updatedLink;
    } catch (error) {
      console.error('Error updating link:', error);
      throw error;
    }
  },

  async deleteLink(id: string): Promise<void> {
    try {
      await firebaseDataManager.delete('links', id);
    } catch (error) {
      console.error('Error deleting link:', error);
      throw error;
    }
  },

  // Analytics
  async getProfileAnalytics(profileId: string): Promise<{ views: number; clicks: number }> {
    try {
      const analytics = await firebaseDataManager.get<{ views: number; clicks: number }>('analytics', profileId);
      
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
      const existing = await firebaseDataManager.get('analytics', profileId);
      if (existing) {
        await firebaseDataManager.update('analytics', profileId, { 
          views: (existing.views || 0) + 1 
        });
      } else {
        await firebaseDataManager.create('analytics', profileId, {
          views: 1,
          clicks: 0
        });
      }
      console.log('Profile view tracked:', profileId);
    } catch (error) {
      console.error('Error tracking profile view:', error);
    }
  },

  async trackLinkClick(linkId: string, profileId: string): Promise<void> {
    try {
      // Track profile clicks
      const existingProfile = await firebaseDataManager.get('analytics', profileId);
      if (existingProfile) {
        await firebaseDataManager.update('analytics', profileId, { 
          clicks: (existingProfile.clicks || 0) + 1 
        });
      } else {
        await firebaseDataManager.create('analytics', profileId, {
          views: 0,
          clicks: 1
        });
      }

      // Track individual link clicks
      const existingLink = await firebaseDataManager.get('link_analytics', linkId);
      if (existingLink) {
        await firebaseDataManager.update('link_analytics', linkId, { 
          clicks: (existingLink.clicks || 0) + 1 
        });
      } else {
        await firebaseDataManager.create('link_analytics', linkId, {
          clicks: 1
        });
      }
      
      console.log('Link click tracked:', linkId, profileId);
    } catch (error) {
      console.error('Error tracking link click:', error);
    }
  },
};
