
// Mock API service that can be easily replaced with your platform's API
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

// Mock data - replace with your API calls
const mockProfiles: Profile[] = [];
const mockLinks: Link[] = [];

export const api = {
  // Profile operations
  async getProfile(userId: string): Promise<Profile | null> {
    return mockProfiles.find(p => p.user_id === userId) || null;
  },

  async createProfile(data: Partial<Profile>): Promise<Profile> {
    const profile: Profile = {
      id: Date.now().toString(),
      user_id: data.user_id!,
      username: data.username!,
      display_name: data.display_name!,
      bio: data.bio || '',
      avatar_url: data.avatar_url || null,
      theme: data.theme || 'default',
      is_public: data.is_public || true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockProfiles.push(profile);
    return profile;
  },

  async updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
    const index = mockProfiles.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Profile not found');
    
    mockProfiles[index] = { ...mockProfiles[index], ...data, updated_at: new Date().toISOString() };
    return mockProfiles[index];
  },

  async getPublicProfile(username: string): Promise<Profile | null> {
    return mockProfiles.find(p => p.username === username && p.is_public) || null;
  },

  // Link operations
  async getLinks(profileId: string): Promise<Link[]> {
    return mockLinks.filter(l => l.profile_id === profileId).sort((a, b) => a.position - b.position);
  },

  async createLink(data: Partial<Link>): Promise<Link> {
    const link: Link = {
      id: Date.now().toString(),
      profile_id: data.profile_id!,
      title: data.title!,
      url: data.url!,
      description: data.description || null,
      position: data.position || 0,
      is_active: data.is_active !== false,
    };
    mockLinks.push(link);
    return link;
  },

  async updateLink(id: string, data: Partial<Link>): Promise<Link> {
    const index = mockLinks.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Link not found');
    
    mockLinks[index] = { ...mockLinks[index], ...data };
    return mockLinks[index];
  },

  async deleteLink(id: string): Promise<void> {
    const index = mockLinks.findIndex(l => l.id === id);
    if (index !== -1) {
      mockLinks.splice(index, 1);
    }
  },

  // Analytics (mock)
  async trackProfileView(profileId: string): Promise<void> {
    console.log('Profile view tracked:', profileId);
  },

  async trackLinkClick(linkId: string, profileId: string): Promise<void> {
    console.log('Link click tracked:', linkId, profileId);
  },
};
