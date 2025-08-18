
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, Profile } from '@/services/api';

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const existingProfile = await api.getProfile(user.id);
      setProfile(existingProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (data: Partial<Profile>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const newProfile = await api.createProfile({
        ...data,
        user_id: user.id,
      });
      setProfile(newProfile);
      return newProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!profile) throw new Error('No profile to update');
    
    try {
      const updatedProfile = await api.updateProfile(profile.id, data);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return {
    profile,
    loading,
    createProfile,
    updateProfile,
    refetch: loadProfile,
  };
};
