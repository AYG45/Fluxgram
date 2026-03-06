import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  isFollowing: boolean;
  followsYou: boolean;
}

export interface Suggestion {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  reason: string;
  following: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private api = inject(ApiService);
  private suggestions = signal<Suggestion[]>([]);
  private loading = signal(false);

  getSuggestions() {
    return this.suggestions.asReadonly();
  }

  isLoading() {
    return this.loading.asReadonly();
  }

  async loadSuggestions() {
    try {
      this.loading.set(true);
      const suggestions = await this.api.get<Suggestion[]>('/users/suggestions/all', true);
      this.suggestions.set(suggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      // Fallback to mock data
      this.loadMockSuggestions();
    } finally {
      this.loading.set(false);
    }
  }

  async getFollowing(): Promise<any[]> {
    try {
      return await this.api.get<any[]>('/users/following/list', true);
    } catch (error) {
      console.error('Failed to load following users:', error);
      return [];
    }
  }

  async getProfile(username: string): Promise<UserProfile> {
    try {
      return await this.api.get<UserProfile>(`/users/${username}`, true);
    } catch (error) {
      console.error('Failed to load profile:', error);
      throw error;
    }
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const result = await this.api.get<{ available: boolean }>(`/users/check-username/${username}`, true);
      return result.available;
    } catch (error) {
      console.error('Failed to check username availability:', error);
      return false;
    }
  }

  async updateProfile(userId: string, data: { username?: string; fullName?: string; bio?: string; avatar?: File }) {
    try {
      const formData = new FormData();
      if (data.username) formData.append('username', data.username);
      if (data.fullName) formData.append('fullName', data.fullName);
      if (data.bio !== undefined) formData.append('bio', data.bio);
      if (data.avatar) formData.append('avatar', data.avatar);

      return await this.api.putFormData(`/users/${userId}`, formData, true);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  async toggleFollow(userId: string) {
    try {
      const result = await this.api.post<{ isFollowing: boolean; followers: number }>(
        `/users/${userId}/follow`,
        {},
        true
      );
      
      // Update suggestions if user is in the list
      this.suggestions.update(suggestions =>
        suggestions.map(s =>
          s.id === userId ? { ...s, following: result.isFollowing } : s
        )
      );
      
      return result;
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      throw error;
    }
  }

  async searchUsers(query: string): Promise<any[]> {
    try {
      if (!query.trim()) return [];
      return await this.api.get<any[]>(`/users/search?q=${encodeURIComponent(query)}`, true);
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  }

  private loadMockSuggestions() {
    const mockSuggestions: Suggestion[] = [
      { id: '1', username: 'creative_studio', fullName: 'Creative Studio', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', reason: 'Followed by sarah_j', following: false },
      { id: '2', username: 'travel_vibes', fullName: 'Travel Vibes', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop', reason: 'Suggested for you', following: false },
      { id: '3', username: 'foodie_heaven', fullName: 'Foodie Heaven', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop', reason: 'Followed by mike_dev', following: false }
    ];
    this.suggestions.set(mockSuggestions);
  }
}
