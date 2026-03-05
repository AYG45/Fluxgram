import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface UserProfile {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatar: string;
  posts: number;
  followers: number;
  following: number;
  isVerified: boolean;
  isFollowing: boolean;
  website?: string;
  isPrivate: boolean;
}

interface Post {
  id: string;
  image: string;
  likes: number;
  comments: number;
  timestamp: Date;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-info">
          <div class="avatar-section">
            <img [src]="profile().avatar" [alt]="profile().username" class="profile-avatar">
            <button class="edit-profile-btn" (click)="toggleEditProfile()">
              {{ isEditingProfile() ? 'Save' : 'Edit Profile' }}
            </button>
          </div>
          
          <div class="user-details">
            <div class="username-section">
              <h1 class="username">{{ profile().username }}</h1>
              @if (profile().isVerified) {
                <svg class="verified-badge" viewBox="0 0 24 24" width="20" height="20">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="#0095f6"/>
                  <path d="M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9z" fill="white"/>
                </svg>
              }
              @if (profile().isPrivate) {
                <svg class="private-badge" viewBox="0 0 24 24" width="16" height="16">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              }
            </div>
            
            @if (isEditingProfile()) {
              <div class="edit-form">
                <input 
                  type="text" 
                  [(ngModel)]="editableProfile().name" 
                  placeholder="Name"
                  class="edit-input">
                <input 
                  type="text" 
                  [(ngModel)]="editableProfile().bio" 
                  placeholder="Bio"
                  class="edit-input">
                <input 
                  type="text" 
                  [(ngModel)]="editableProfile().website" 
                  placeholder="Website"
                  class="edit-input">
              </div>
            } @else {
              <h2 class="display-name">{{ profile().name }}</h2>
              <p class="bio">{{ profile().bio }}</p>
              @if (profile().website) {
                <a [href]="profile().website" target="_blank" class="website-link">
                  {{ profile().website }}
                </a>
              }
            }
          </div>
        </div>

        <!-- Stats Section -->
        <div class="stats-section">
          <div class="stat-item">
            <span class="stat-number">{{ profile().posts }}</span>
            <span class="stat-label">posts</span>
          </div>
          <div class="stat-item" (click)="showFollowers.set(true)">
            <span class="stat-number">{{ formatNumber(profile().followers) }}</span>
            <span class="stat-label">followers</span>
          </div>
          <div class="stat-item" (click)="showFollowing.set(true)">
            <span class="stat-number">{{ formatNumber(profile().following) }}</span>
            <span class="stat-label">following</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button 
            class="follow-btn" 
            [class.following]="profile().isFollowing"
            (click)="toggleFollow()">
            {{ profile().isFollowing ? 'Following' : 'Follow' }}
          </button>
          <button class="message-btn" (click)="openMessage()">
            Message
          </button>
          <button class="more-btn" (click)="toggleProfileMenu()">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <circle cx="12" cy="12" r="1.5"/>
              <circle cx="12" cy="5" r="1.5"/>
              <circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="profile-tabs">
        <button 
          class="tab-btn" 
          [class.active]="activeTab() === 'posts'"
          (click)="activeTab.set('posts')">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M3 8l4-4 4 4M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab() === 'saved'"
          (click)="activeTab.set('saved')">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
          </svg>
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab() === 'tagged'"
          (click)="activeTab.set('tagged')">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M20.65 3.35c-.2-.2-.45-.29-.71-.29h-16c-.26 0-.51.1-.7.29-.2.2-.29.45-.29.71v16c0 .26.1.51.29.7.19.2.44.29.7.29h16c.26 0 .51-.1.7-.29.2-.19.29-.44.29-.7V4.05c0-.26-.1-.51-.29-.7zM12 17.3c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
          </svg>
        </button>
      </div>

      <!-- Content Area -->
      <div class="content-area">
        @switch (activeTab()) {
          @case ('posts') {
            <div class="posts-grid">
              @for (post of posts(); track post.id) {
                <div class="post-item" (click)="openPost(post.id)">
                  <img [src]="post.image" [alt]="post.id">
                  <div class="post-overlay">
                    <div class="post-stats">
                      <span class="stat">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        {{ formatNumber(post.likes) }}
                      </span>
                      <span class="stat">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                        </svg>
                        {{ formatNumber(post.comments) }}
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
          @case ('saved') {
            <div class="empty-state">
              <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor">
                <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
              </svg>
              <h3>Saved Posts</h3>
              <p>Posts you've saved will appear here</p>
            </div>
          }
          @case ('tagged') {
            <div class="empty-state">
              <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor">
                <path d="M20.65 3.35c-.2-.2-.45-.29-.71-.29h-16c-.26 0-.51.1-.7.29-.2.2-.29.45-.29.71v16c0 .26.1.51.29.7.19.2.44.29.7.29h16c.26 0 .51-.1.7-.29.2-.19.29-.44.29-.7V4.05c0-.26-.1-.51-.29-.7zM12 17.3c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
              </svg>
              <h3>Photos of You</h3>
              <p>When people tag you in photos, they'll appear here</p>
            </div>
          }
        }
      </div>

      <!-- Followers Modal -->
      @if (showFollowers()) {
        <div class="modal-overlay" (click)="showFollowers.set(false)">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Followers</h3>
              <button class="close-btn" (click)="showFollowers.set(false)">×</button>
            </div>
            <div class="modal-content">
              @for (follower of mockFollowers; track follower.id) {
                <div class="user-item">
                  <img [src]="follower.avatar" [alt]="follower.username">
                  <div class="user-info">
                    <span class="username">{{ follower.username }}</span>
                    <span class="name">{{ follower.name }}</span>
                  </div>
                  <button class="follow-small-btn">Follow</button>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Following Modal -->
      @if (showFollowing()) {
        <div class="modal-overlay" (click)="showFollowing.set(false)">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Following</h3>
              <button class="close-btn" (click)="showFollowing.set(false)">×</button>
            </div>
            <div class="modal-content">
              @for (following of mockFollowing; track following.id) {
                <div class="user-item">
                  <img [src]="following.avatar" [alt]="following.username">
                  <div class="user-info">
                    <span class="username">{{ following.username }}</span>
                    <span class="name">{{ following.name }}</span>
                  </div>
                  <button class="following-small-btn">Following</button>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 935px;
      margin: 0 auto;
      padding: 20px;
      min-height: 100vh;
    }

    .profile-header {
      margin-bottom: 44px;
    }

    .profile-info {
      display: flex;
      align-items: flex-start;
      gap: 30px;
      margin-bottom: 20px;
    }

    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .profile-avatar {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--border-color);
    }

    .edit-profile-btn {
      background: var(--accent-color);
      color: white;
      border: none;
      padding: 8px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .edit-profile-btn:hover {
      opacity: 0.9;
    }

    .user-details {
      flex: 1;
    }

    .username-section {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .username {
      font-size: 28px;
      font-weight: 300;
      margin: 0;
    }

    .verified-badge {
      margin-bottom: 4px;
    }

    .private-badge {
      color: var(--text-secondary);
    }

    .display-name {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .bio {
      font-size: 16px;
      line-height: 1.4;
      margin: 0 0 8px 0;
      color: var(--text-primary);
    }

    .website-link {
      color: var(--accent-color);
      text-decoration: none;
      font-size: 16px;
    }

    .website-link:hover {
      text-decoration: underline;
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .edit-input {
      padding: 8px 12px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 14px;
      background: var(--bg-secondary);
      color: var(--text-primary);
    }

    .stats-section {
      display: flex;
      gap: 40px;
      margin-bottom: 20px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
    }

    .stat-number {
      font-size: 18px;
      font-weight: 600;
    }

    .stat-label {
      font-size: 14px;
      color: var(--text-secondary);
      text-transform: lowercase;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .follow-btn {
      background: var(--accent-color);
      color: white;
      border: none;
      padding: 8px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .follow-btn.following {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .message-btn {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      padding: 8px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .more-btn {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .profile-tabs {
      display: flex;
      border-top: 1px solid var(--border-color);
      margin-bottom: 20px;
    }

    .tab-btn {
      flex: 1;
      padding: 16px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.2s;
      border-top: 2px solid transparent;
    }

    .tab-btn.active {
      color: var(--text-primary);
      border-top-color: var(--text-primary);
    }

    .content-area {
      min-height: 400px;
    }

    .posts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 28px;
    }

    .post-item {
      position: relative;
      aspect-ratio: 1;
      cursor: pointer;
      overflow: hidden;
      border-radius: 4px;
    }

    .post-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .post-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .post-item:hover .post-overlay {
      opacity: 1;
    }

    .post-stats {
      display: flex;
      gap: 20px;
      color: white;
      font-weight: 600;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: var(--text-secondary);
    }

    .empty-state svg {
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 300;
    }

    .empty-state p {
      margin: 0;
      font-size: 16px;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: var(--bg-primary);
      border-radius: 12px;
      width: 400px;
      max-height: 80vh;
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .modal-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--text-secondary);
    }

    .modal-content {
      max-height: 400px;
      overflow-y: auto;
    }

    .user-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
    }

    .user-item img {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-info {
      flex: 1;
    }

    .user-info .username {
      display: block;
      font-weight: 600;
      font-size: 14px;
    }

    .user-info .name {
      display: block;
      color: var(--text-secondary);
      font-size: 14px;
    }

    .follow-small-btn {
      background: var(--accent-color);
      color: white;
      border: none;
      padding: 6px 16px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
    }

    .following-small-btn {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      padding: 6px 16px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 16px;
        max-width: 100%;
        margin-bottom: 60px;
      }

      .profile-info {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 16px;
      }

      .profile-avatar {
        width: 77px;
        height: 77px;
      }

      .username {
        font-size: 20px;
      }

      .stats-section {
        justify-content: space-around;
        gap: 0;
      }

      .posts-grid {
        gap: 2px;
      }

      .modal {
        width: 90%;
        max-width: 400px;
      }
    }
  `]
})
export class ProfileComponent {
  profile = signal<UserProfile>({
    id: '1',
    username: 'johndoe',
    name: 'John Doe',
    bio: 'Photographer | Traveler | Coffee enthusiast ☕\n📍 New York\n📷 john@photography.com',
    avatar: 'https://picsum.photos/150/150?random=profile',
    posts: 42,
    followers: 1234,
    following: 567,
    isVerified: true,
    isFollowing: false,
    website: 'https://johndoe.com',
    isPrivate: false
  });

  posts = signal<Post[]>([]);
  activeTab = signal<'posts' | 'saved' | 'tagged'>('posts');
  isEditingProfile = signal(false);
  showFollowers = signal(false);
  showFollowing = signal(false);

  editableProfile = signal<Partial<UserProfile>>({});

  mockFollowers = [
    { id: '1', username: 'user1', name: 'User One', avatar: 'https://picsum.photos/44/44?random=101' },
    { id: '2', username: 'user2', name: 'User Two', avatar: 'https://picsum.photos/44/44?random=102' },
    { id: '3', username: 'user3', name: 'User Three', avatar: 'https://picsum.photos/44/44?random=103' }
  ];

  mockFollowing = [
    { id: '4', username: 'user4', name: 'User Four', avatar: 'https://picsum.photos/44/44?random=104' },
    { id: '5', username: 'user5', name: 'User Five', avatar: 'https://picsum.photos/44/44?random=105' },
    { id: '6', username: 'user6', name: 'User Six', avatar: 'https://picsum.photos/44/44?random=106' }
  ];

  constructor() {
    this.loadPosts();
  }

  private loadPosts() {
    const mockPosts: Post[] = [];
    for (let i = 0; i < 42; i++) {
      mockPosts.push({
        id: `post-${i}`,
        image: `https://picsum.photos/300/300?random=${i + 1000}`,
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 100),
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 30)
      });
    }
    this.posts.set(mockPosts);
  }

  toggleEditProfile() {
    if (this.isEditingProfile()) {
      // Save changes
      this.profile.update(current => ({
        ...current,
        ...this.editableProfile()
      }));
      this.isEditingProfile.set(false);
    } else {
      // Start editing
      this.editableProfile.set({
        name: this.profile().name,
        bio: this.profile().bio,
        website: this.profile().website
      });
      this.isEditingProfile.set(true);
    }
  }

  toggleFollow() {
    this.profile.update(current => ({
      ...current,
      isFollowing: !current.isFollowing,
      followers: current.isFollowing ? current.followers - 1 : current.followers + 1
    }));
  }

  openMessage() {
    console.log('Opening message for user:', this.profile().username);
  }

  toggleProfileMenu() {
    console.log('Toggle profile menu');
  }

  openPost(postId: string) {
    console.log('Opening post:', postId);
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}
