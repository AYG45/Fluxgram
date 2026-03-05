import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  notifications = this.notificationService.getNotifications();
  loading = this.notificationService.isLoading();
  currentUser = this.authService.getCurrentUser();
  activeTab = signal<'all' | 'likes' | 'comments' | 'follows'>('all');

  // Computed properties for filtered notifications
  todayNotifications = computed(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return this.notifications().filter(n => {
      const notifDate = new Date(n.time);
      return notifDate >= today;
    });
  });

  weekNotifications = computed(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return this.notifications().filter(n => {
      const notifDate = new Date(n.time);
      return notifDate < today && notifDate >= weekAgo;
    });
  });

  earlierNotifications = computed(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return this.notifications().filter(n => {
      const notifDate = new Date(n.time);
      return notifDate < weekAgo;
    });
  });

  async ngOnInit() {
    await this.notificationService.loadNotifications();
  }

  async toggleFollow(notif: any) {
    try {
      console.log('Toggle follow for notification:', notif);
      console.log('User ID:', notif.userId);
      console.log('From:', notif.from);
      
      // Optimistically update UI
      notif.following = !notif.following;
      
      // Use userId if available, otherwise use username
      const identifier = notif.userId || notif.from || notif.username;
      console.log('Using identifier:', identifier);
      
      const result = await this.userService.toggleFollow(identifier);
      console.log('Toggle follow result:', result);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      // Revert on error
      notif.following = !notif.following;
    }
  }

  async markAsReadAndNavigate(notif: any) {
    // Mark as read
    if (!notif.read) {
      await this.notificationService.markAsRead(notif.id);
    }

    // Navigate based on notification type
    if (notif.type === 'follow') {
      // Navigate to user profile
      this.router.navigate(['/profile', notif.username]);
    } else if (notif.type === 'like' || notif.type === 'comment') {
      // Navigate to post detail page
      if (notif.postId) {
        this.router.navigate(['/post', notif.postId]);
      } else {
        // Fallback to user profile if no postId
        this.router.navigate(['/profile', notif.username]);
      }
    }
  }

  async markAllRead() {
    await this.notificationService.markAllAsRead();
    // Reload to update the UI
    await this.notificationService.loadNotifications();
  }

  getNotificationText(notification: any): string {
    switch (notification.type) {
      case 'like':
        return 'liked your photo';
      case 'comment':
        // Show the comment text if available
        if (notification.text) {
          // Truncate long comments
          const maxLength = 50;
          const comment = notification.text.length > maxLength 
            ? notification.text.substring(0, maxLength) + '...' 
            : notification.text;
          return `commented: "${comment}"`;
        }
        return 'commented on your photo';
      case 'follow':
        return 'started following you';
      case 'mention':
        return 'mentioned you in a comment';
      default:
        return '';
    }
  }

  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now.getTime() - notifDate.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}w`;
  }
}
