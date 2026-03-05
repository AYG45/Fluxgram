import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  user: {
    username: string;
    fullName: string;
    avatar: string;
  };
  userId?: string;
  username?: string;
  avatar?: string;
  text?: string;
  postImage?: string;
  time: Date | string;
  read: boolean;
  following?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private api = inject(ApiService);
  private notifications = signal<Notification[]>([]);
  private loading = signal(false);

  getNotifications() {
    return this.notifications.asReadonly();
  }

  isLoading() {
    return this.loading.asReadonly();
  }

  async loadNotifications() {
    try {
      this.loading.set(true);
      console.log('🔔 Loading notifications from backend...');
      
      const notifications = await this.api.get<any[]>('/notifications', true);
      
      console.log('✅ Backend response:', notifications);
      console.log('📊 Number of notifications:', notifications.length);
      
      // Map to include flat properties for template
      const mappedNotifications = notifications.map(n => ({
        ...n,
        username: n.user?.username || 'Unknown',
        avatar: n.user?.avatar || 'https://via.placeholder.com/100',
        userId: n.from?._id || n.from || n.user?._id,
        postId: n.postId, // Include postId from backend
        following: n.user?.isFollowing || false // Use the isFollowing status from backend
      }));
      
      console.log('🗺️ Mapped notifications:', mappedNotifications);
      this.notifications.set(mappedNotifications);
    } catch (error) {
      console.error('❌ Failed to load notifications:', error);
      console.error('Error details:', error);
      // Set empty array instead of mock data
      this.notifications.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async markAsRead(notificationId: string) {
    try {
      await this.api.put(`/notifications/${notificationId}/read`, {}, true);
      this.notifications.update(notifs =>
        notifs.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async markAllAsRead() {
    try {
      await this.api.put('/notifications/read/all', {}, true);
      this.notifications.update(notifs =>
        notifs.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }

  getUnreadCount(): number {
    return this.notifications().filter(n => !n.read).length;
  }
}
