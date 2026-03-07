import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-horizontal-suggestions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="horizontal-suggestions">
      <div class="suggestions-header">
        <span class="title">Suggestions For You</span>
        <a routerLink="/discover-people" class="see-all">See All</a>
      </div>
      
      <div class="suggestions-scroll">
        @for (user of suggestions(); track user.id) {
          <div class="suggestion-card">
            <a [routerLink]="['/profile', user.username]" class="user-link">
              <img [src]="user.avatar" [alt]="user.username" class="user-avatar">
              <div class="user-info">
                <span class="username">{{ user.username }}</span>
                <span class="reason">{{ user.reason }}</span>
              </div>
            </a>
            <button 
              class="follow-btn" 
              [class.following]="user.following"
              (click)="toggleFollow(user)">
              {{ user.following ? 'Following' : 'Follow' }}
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .horizontal-suggestions {
      display: none;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 16px;
      margin-bottom: 24px;
    }

    .suggestions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .see-all {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
      text-decoration: none;
    }

    .suggestions-scroll {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .suggestions-scroll::-webkit-scrollbar {
      display: none;
    }

    .suggestion-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      min-width: 140px;
      padding: 16px 12px;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      flex-shrink: 0;
    }

    .user-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      text-align: center;
    }

    .user-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--border);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .username {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .reason {
      font-size: 11px;
      color: var(--text-secondary);
    }

    .follow-btn {
      width: 100%;
      padding: 6px 16px;
      background: var(--text-primary);
      color: var(--bg-primary);
      border: none;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .follow-btn:hover {
      transform: translateY(-1px);
    }

    .follow-btn.following {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }

    @media (max-width: 768px) {
      .horizontal-suggestions {
        display: block;
        border-radius: 0;
        border-left: none;
        border-right: none;
        margin-bottom: 0;
      }
    }
  `]
})
export class HorizontalSuggestionsComponent implements OnInit {
  private userService = inject(UserService);
  
  suggestions = this.userService.getSuggestions();

  async ngOnInit() {
    await this.userService.loadSuggestions();
  }

  async toggleFollow(user: any) {
    try {
      await this.userService.toggleFollow(user.id);
      await this.userService.loadSuggestions();
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  }
}
