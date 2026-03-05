import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StoryService, StoryGroup } from '../../services/story.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-story-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './story-viewer.component.html',
  styleUrl: './story-viewer.component.css'
})
export class StoryViewerComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storyService = inject(StoryService);
  private authService = inject(AuthService);
  
  userId = '';
  storyGroup = signal<StoryGroup | null>(null);
  currentStoryIndex = signal(0);
  progress = signal(0);
  currentUser = this.authService.getCurrentUser();
  
  private progressInterval: any;
  private autoDeleteTimeout: any;
  private readonly STORY_DURATION = 10000; // 10 seconds
  private readonly PROGRESS_INTERVAL = 100; // Update progress every 100ms

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userId = params['userId'];
      this.loadStories();
    });
  }

  ngOnDestroy() {
    this.clearTimers();
  }

  async loadStories() {
    const allStories = this.storyService.getStories()();
    const group = allStories.find(g => g.userId === this.userId);
    
    if (!group || group.stories.length === 0) {
      this.router.navigate(['/']);
      return;
    }

    this.storyGroup.set(group);
    this.startStory();
  }

  startStory() {
    this.clearTimers();
    this.progress.set(0);

    const currentStory = this.getCurrentStory();
    if (!currentStory) return;

    // Mark story as viewed
    this.storyService.viewStory(currentStory.id);

    // Progress bar animation
    const progressStep = (this.PROGRESS_INTERVAL / this.STORY_DURATION) * 100;
    this.progressInterval = setInterval(() => {
      this.progress.update(p => {
        const newProgress = p + progressStep;
        if (newProgress >= 100) {
          this.nextStory();
          return 0;
        }
        return newProgress;
      });
    }, this.PROGRESS_INTERVAL);

    // Auto-delete after 30 seconds
    this.autoDeleteTimeout = setTimeout(() => {
      this.nextStory();
    }, this.STORY_DURATION);
  }

  getCurrentStory() {
    const group = this.storyGroup();
    if (!group) return null;
    return group.stories[this.currentStoryIndex()];
  }

  isOwnStory() {
    return this.currentUser()?.id === this.userId;
  }

  openAddStory() {
    const input = document.querySelector('#storyFileInput') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  async onStoryFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      try {
        // Pause current story
        this.clearTimers();

        // Upload all selected files as separate stories
        for (let i = 0; i < input.files.length; i++) {
          const file = input.files[i];
          await this.storyService.createStory(file);
        }
        
        input.value = ''; // Reset input
        
        // Reload stories to show new ones
        await this.loadStories();
      } catch (error) {
        console.error('Failed to create story:', error);
        alert('Failed to create story. Please try again.');
        // Resume story on error
        this.startStory();
      }
    }
  }

  async deleteCurrentStory() {
    const currentStory = this.getCurrentStory();
    if (!currentStory || !this.isOwnStory()) return;

    if (!confirm('Are you sure you want to delete this story?')) {
      return;
    }

    try {
      await this.storyService.deleteStory(currentStory.id);
      
      // Remove story from local state
      const group = this.storyGroup();
      if (group) {
        const updatedStories = group.stories.filter(s => s.id !== currentStory.id);
        
        if (updatedStories.length === 0) {
          // No more stories, close viewer
          this.close();
        } else {
          // Update group with remaining stories
          this.storyGroup.set({
            ...group,
            stories: updatedStories
          });
          
          // Adjust current index if needed
          if (this.currentStoryIndex() >= updatedStories.length) {
            this.currentStoryIndex.set(updatedStories.length - 1);
          }
          
          // Restart story
          this.startStory();
        }
      }
    } catch (error) {
      console.error('Failed to delete story:', error);
      alert('Failed to delete story. Please try again.');
    }
  }

  nextStory() {
    const group = this.storyGroup();
    if (!group) return;

    if (this.currentStoryIndex() < group.stories.length - 1) {
      this.currentStoryIndex.update(i => i + 1);
      this.startStory();
    } else {
      // No more stories, close viewer
      this.close();
    }
  }

  previousStory() {
    if (this.currentStoryIndex() > 0) {
      this.currentStoryIndex.update(i => i - 1);
      this.startStory();
    }
  }

  close() {
    this.clearTimers();
    this.router.navigate(['/']);
  }

  private clearTimers() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    if (this.autoDeleteTimeout) {
      clearTimeout(this.autoDeleteTimeout);
    }
  }

  onImageClick(event: MouseEvent) {
    const clickX = event.clientX;
    const screenWidth = window.innerWidth;
    
    // Click on left side = previous, right side = next
    if (clickX < screenWidth / 2) {
      this.previousStory();
    } else {
      this.nextStory();
    }
  }
}
