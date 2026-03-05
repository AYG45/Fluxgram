import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface Story {
  id: string;
  image: string;
  createdAt: Date;
  expiresAt: Date;
  hasViewed: boolean;
}

export interface StoryGroup {
  userId: string;
  username: string;
  userAvatar: string;
  stories: Story[];
  hasViewed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private api = inject(ApiService);
  private stories = signal<StoryGroup[]>([]);
  private loading = signal(false);

  getStories() {
    return this.stories.asReadonly();
  }

  isLoading() {
    return this.loading.asReadonly();
  }

  async loadStories() {
    try {
      this.loading.set(true);
      const stories = await this.api.get<StoryGroup[]>('/stories', true);
      this.stories.set(stories);
    } catch (error) {
      console.error('Failed to load stories:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async createStory(image: File) {
    try {
      const formData = new FormData();
      formData.append('image', image);

      const result = await this.api.postFormData<{ story: any }>('/stories', formData, true);
      
      // Reload stories to get updated list
      await this.loadStories();
      
      return result.story;
    } catch (error) {
      console.error('Failed to create story:', error);
      throw error;
    }
  }

  async viewStory(storyId: string) {
    try {
      await this.api.post(`/stories/${storyId}/view`, {}, true);
      
      // Update local state to mark story as viewed
      this.stories.update(groups => 
        groups.map(group => ({
          ...group,
          stories: group.stories.map(story => 
            story.id === storyId ? { ...story, hasViewed: true } : story
          ),
          hasViewed: group.stories.every(s => 
            s.id === storyId ? true : s.hasViewed
          )
        }))
      );
    } catch (error) {
      console.error('Failed to mark story as viewed:', error);
    }
  }

  async deleteStory(storyId: string) {
    try {
      await this.api.delete(`/stories/${storyId}`, true);
      await this.loadStories();
    } catch (error) {
      console.error('Failed to delete story:', error);
      throw error;
    }
  }
}
