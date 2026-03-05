import { Injectable, signal, inject } from '@angular/core';
import { Post } from '../models/post.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private api = inject(ApiService);
  private posts = signal<Post[]>([]);
  private loading = signal(false);

  constructor() {
    this.loadPosts();
  }

  getPosts() {
    return this.posts.asReadonly();
  }

  isLoading() {
    return this.loading.asReadonly();
  }

  async loadPosts() {
    try {
      this.loading.set(true);
      const posts = await this.api.get<Post[]>('/posts', true);
      this.posts.set(posts);
    } catch (error) {
      console.error('Failed to load posts:', error);
      this.posts.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async loadExplorePosts(): Promise<Post[]> {
    try {
      const posts = await this.api.get<Post[]>('/posts/explore', true);
      return posts;
    } catch (error) {
      console.error('Failed to load explore posts:', error);
      return [];
    }
  }

  async searchPostsByTag(tag: string): Promise<Post[]> {
    try {
      const posts = await this.api.get<Post[]>(`/posts/explore?tag=${encodeURIComponent(tag)}`, true);
      return posts;
    } catch (error) {
      console.error('Failed to search posts by tag:', error);
      return [];
    }
  }

  async searchTags(query: string): Promise<{ tag: string; count: number }[]> {
    try {
      const tags = await this.api.get<{ tag: string; count: number }[]>(
        `/posts/search/tags?q=${encodeURIComponent(query)}`,
        true
      );
      return tags;
    } catch (error) {
      console.error('Failed to search tags:', error);
      return [];
    }
  }

  async createPost(images: File[], caption: string, location?: string, tags?: string) {
    try {
      const formData = new FormData();
      images.forEach(image => formData.append('images', image));
      formData.append('caption', caption);
      if (location) formData.append('location', location);
      if (tags) formData.append('tags', tags);

      const result = await this.api.postFormData<{ post: Post }>('/posts', formData, true);
      this.posts.update(posts => [result.post, ...posts]);
      return result.post;
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  }

  async likePost(postId: string) {
    try {
      const result = await this.api.post<{ likes: number; isLiked: boolean }>(
        `/posts/${postId}/like`,
        {},
        true
      );
      
      this.posts.update(posts =>
        posts.map(p =>
          p.id === postId
            ? { ...p, likes: result.likes, isLiked: result.isLiked }
            : p
        )
      );
    } catch (error) {
      console.error('Failed to like post:', error);
      // Optimistic update fallback
      this.posts.update(posts =>
        posts.map(p =>
          p.id === postId
            ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
            : p
        )
      );
    }
  }

  async getComments(postId: string): Promise<any[]> {
    try {
      const comments = await this.api.get<any[]>(`/posts/${postId}/comments`, true);
      return comments;
    } catch (error) {
      console.error('Failed to get comments:', error);
      return [];
    }
  }

  async addComment(postId: string, text: string) {
    try {
      const result = await this.api.post<{ comments: number }>(
        `/posts/${postId}/comment`,
        { text },
        true
      );
      
      this.posts.update(posts =>
        posts.map(p =>
          p.id === postId ? { ...p, comments: result.comments } : p
        )
      );
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  }

  async deleteComment(postId: string, commentId: string) {
    try {
      await this.api.delete(`/posts/${postId}/comments/${commentId}`, true);
      
      this.posts.update(posts =>
        posts.map(p =>
          p.id === postId ? { ...p, comments: Math.max(0, p.comments - 1) } : p
        )
      );
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw error;
    }
  }

  async savePost(postId: string) {
    try {
      await this.api.post(`/posts/${postId}/save`, {}, true);
      
      // Update local state
      this.posts.update(posts =>
        posts.map(p => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p))
      );
    } catch (error) {
      console.error('Failed to save post:', error);
      throw error;
    }
  }

  async deletePost(postId: string) {
    try {
      await this.api.delete(`/posts/${postId}`, true);
      this.posts.update(posts => posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Failed to delete post:', error);
      throw error;
    }
  }

  async getUserPosts(username: string): Promise<Post[]> {
    try {
      const posts = await this.api.get<Post[]>(`/posts/user/${username}`, true);
      return posts;
    } catch (error) {
      console.error('Failed to get user posts:', error);
      return [];
    }
  }

  async getSavedPosts(): Promise<Post[]> {
    try {
      const posts = await this.api.get<Post[]>('/posts/saved', true);
      return posts;
    } catch (error) {
      console.error('Failed to get saved posts:', error);
      return [];
    }
  }

  async getPostById(postId: string): Promise<Post | null> {
    try {
      const post = await this.api.get<Post>(`/posts/${postId}`, true);
      return post;
    } catch (error) {
      console.error('Failed to get post by ID:', error);
      return null;
    }
  }
}
