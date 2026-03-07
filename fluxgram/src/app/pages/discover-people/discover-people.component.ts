import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-discover-people',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="discover-people">
      <div class="header">
        <h1>Discover People</h1>
        <p>Find people you might want to follow</p>
      </div>

      @if (loading()) {
        <div class="loading-state">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="skeleton-item">
              <div class="skeleton-avatar"></div>
              <div class="skeleton-info">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
              </div>
              <div class="skeleton-button"></div>
            </div>
          }
        </div>
      } @else if (allUsers().length === 0) {
        <div class="empty-state">
          <svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <h3>No users found</h3>
          <p>You're already following everyone!</p>
        </div>
      } @else {
        <div class="users-grid">
          @for (user of allUsers(); track user.id) {
            <div class="user-card">
              <a [routerLink]="['/profile', user.username]" class="user-link">
                <img [src]="user.avatar" [alt]="user.username" class="user-avatar">
                <div class="user-info">
                  <span class="username">{{ user.username }}</span>
                  <span class="fullname">{{ user.fullName }}</span>
                  @if (user.bio) {
                    <span class="bio">{{ user.bio }}</span>
                  }
                </div>
              </a>
              <button 
                class="follow-btn" 
                [class.following]="user.following"
                (click)="toggleFollow(user)"
                [disabled]="user.loading">
                {{ user.following ? 'Following' : 'Follow' }}
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .discover-people {
      min-height: 100vh;
      padding: 32px 24px;
      max-width: 935px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 32px;
    }

    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .header p {
      font-size: 15px;
      color: var(--text-secondary);
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .skeleton-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }

    .skeleton-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(
        90deg,
        var(--bg-tertiary) 0%,
        var(--bg-hover) 50%,
        var(--bg-tertiary) 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }

    .skeleton-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skeleton-line {
      height: 14px;
      background: linear-gradient(
        90deg,
        var(--bg-tertiary) 0%,
        var(--bg-hover) 50%,
        var(--bg-tertiary) 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: 4px;
    }

    .skeleton-line.short {
      width: 60%;
    }

    .skeleton-button {
      width: 80px;
      height: 32px;
      background: linear-gradient(
        90deg,
        var(--bg-tertiary) 0%,
        var(--bg-hover) 50%,
        var(--bg-tertiary) 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: var(--radius-md);
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 80px 20px;
    }

    .empty-state svg {
      color: var(--text-tertiary);
      margin-bottom: 24px;
      opacity: 0.3;
    }

    .empty-state h3 {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .empty-state p {
      font-size: 15px;
      color: var(--text-secondary);
    }

    /* Users Grid */
    .users-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      transition: all 0.2s;
    }

    .user-card:hover {
      border-color: var(--border-hover);
      box-shadow: var(--shadow-md);
    }

    .user-link {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
      text-decoration: none;
      min-width: 0;
    }

    .user-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--border);
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 0;
    }

    .username {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .fullname {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .bio {
      font-size: 13px;
      color: var(--text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .follow-btn {
      padding: 8px 24px;
      background: var(--text-primary);
      color: var(--bg-primary);
      border: none;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .follow-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .follow-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .follow-btn.following {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .discover-people {
        padding: 16px 12px;
        padding-bottom: 80px;
      }

      .header {
        margin-bottom: 24px;
      }

      .header h1 {
        font-size: 24px;
      }

      .user-card {
        padding: 12px;
      }

      .user-avatar {
        width: 48px;
        height: 48px;
      }

      .follow-btn {
        padding: 6px 16px;
        font-size: 13px;
      }
    }
  `]
})
export class DiscoverPeopleComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  
  allUsers = signal<any[]>([]);
  loading = signal(true);
  currentUser = this.authService.getCurrentUser();

  async ngOnInit() {
    await this.loadAllUsers();
  }

  async loadAllUsers() {
    try {
      this.loading.set(true);
      // Get all users that current user doesn't follow
      const users = await this.userService.getAllUsers();
      this.allUsers.set(users);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async toggleFollow(user: any) {
    try {
      user.loading = true;
      await this.userService.toggleFollow(user.id);
      
      // Update the user's following status
      this.allUsers.update(users =>
        users.map(u => u.id === user.id ? { ...u, following: !u.following, loading: false } : u)
      );
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      user.loading = false;
    }
  }
}
