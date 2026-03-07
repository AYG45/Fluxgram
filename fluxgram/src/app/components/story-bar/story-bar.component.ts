import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StoryService } from '../../services/story.service';

@Component({
  selector: 'app-story-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="story-bar">
      @if (currentUser()) {
        <div class="story-item your-story" (click)="viewMyStory()">
          <div class="story-ring" [class.seen]="myStories().length > 0 && myStories()[0].hasViewed">
            <img [src]="currentUser()!.avatar || 'https://i.pravatar.cc/150?img=13'" alt="Your story" class="story-avatar">
            <button class="add-story" (mousedown)="onAddStoryClick($event)">+</button>
            <input 
              type="file" 
              #fileInput 
              accept="image/*" 
              multiple
              (change)="onFileSelected($event)" 
              style="display: none"
            >
          </div>
          <span class="story-username">Your story</span>
        </div>
      }

      @for (group of otherStories(); track group.userId) {
        <div class="story-item" (click)="viewStory(group)">
          <div class="story-ring" [class.seen]="group.hasViewed">
            <img [src]="group.userAvatar" [alt]="group.username" class="story-avatar">
          </div>
          <span class="story-username">{{ group.username }}</span>
        </div>
      }

      @if (otherStories().length === 0 && !loading()) {
        <div class="empty-stories">
          <p>Follow people to see their stories</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .story-bar {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      margin-bottom: 24px;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .story-bar::-webkit-scrollbar {
      display: none;
    }

    .story-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      flex-shrink: 0;
    }

    .story-ring {
      width: 66px;
      height: 66px;
      border-radius: 50%;
      padding: 2px;
      background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .story-ring.seen {
      background: #8e8e8e;
    }

    .story-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 3px solid var(--bg-secondary);
      object-fit: cover;
    }

    .add-story {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 20px;
      height: 20px;
      background: #0095f6;
      color: white;
      border: 3px solid var(--bg-secondary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      line-height: 1;
      padding: 0;
    }

    .story-username {
      font-size: 12px;
      color: var(--text-primary);
      max-width: 70px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: center;
    }

    .empty-stories {
      display: flex;
      align-items: center;
      padding: 0 20px;
      color: var(--text-secondary);
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .story-bar {
        border-radius: 0;
        border-left: none;
        border-right: none;
        margin-bottom: 0;
        padding: 12px 16px;
      }

      .story-ring {
        width: 60px;
        height: 60px;
      }

      .story-avatar {
        width: 56px;
        height: 56px;
        border-width: 2px;
      }

      .add-story {
        width: 16px;
        height: 16px;
        font-size: 12px;
        border-width: 2px;
        bottom: -1px;
        right: -1px;
      }
    }
  `]
})
export class StoryBarComponent implements OnInit {
  private authService = inject(AuthService);
  private storyService = inject(StoryService);
  private router = inject(Router);
  
  currentUser = this.authService.getCurrentUser();
  storyGroups = this.storyService.getStories();
  loading = this.storyService.isLoading();
  fileInput: HTMLInputElement | null = null;

  async ngOnInit() {
    await this.storyService.loadStories();
  }

  myStories() {
    const userId = this.currentUser()?.id;
    if (!userId) return [];
    
    const myGroup = this.storyGroups().find(g => g.userId === userId);
    return myGroup?.stories || [];
  }

  otherStories() {
    const userId = this.currentUser()?.id;
    if (!userId) return this.storyGroups();
    
    // Filter out current user's stories from the list
    return this.storyGroups().filter(g => g.userId !== userId);
  }

  openStoryUpload() {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  onAddStoryClick(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.openStoryUpload();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      try {
        // Upload all selected files as separate stories
        for (let i = 0; i < input.files.length; i++) {
          const file = input.files[i];
          await this.storyService.createStory(file);
        }
        input.value = ''; // Reset input
      } catch (error) {
        console.error('Failed to create story:', error);
        alert('Failed to create story. Please try again.');
      }
    }
  }

  viewStory(group: any) {
    // Navigate to story viewer
    this.router.navigate(['/stories', group.userId]);
  }

  viewMyStory() {
    const userId = this.currentUser()?.id;
    if (!userId) return;
    
    // Check if user has stories
    const myGroup = this.storyGroups().find(g => g.userId === userId);
    if (myGroup && myGroup.stories.length > 0) {
      // Navigate to story viewer
      this.router.navigate(['/stories', userId]);
    }
  }
}
