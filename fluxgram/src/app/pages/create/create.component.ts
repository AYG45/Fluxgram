import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="create">
      <div class="create-modal">
        @if (!selectedFile()) {
          <div class="upload-area">
            <div class="upload-content">
              <svg class="upload-icon" viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="3" width="20" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="2.5"/>
                <path d="M14.5 21l-2.5-3-2.5 3"/>
                <polyline points="22 13 16 7 2 21"/>
              </svg>
              <p class="upload-text">Drag photos here</p>
              <button type="button" class="upload-btn" (click)="fileInput.click()">Select from computer</button>
            </div>
            <input #fileInput type="file" accept="image/*" hidden (change)="onFileSelect($event)">
          </div>
        } @else {
          <div class="preview-area">
            <img [src]="previewUrl()" alt="Preview" class="preview-image">
            <div class="caption-area">
              <textarea 
                placeholder="Write a caption... (use #hashtags)"
                [(ngModel)]="caption"
                (input)="onCaptionChange()"
                rows="5"></textarea>
              
              @if (detectedTags().length > 0) {
                <div class="detected-tags">
                  <span class="tags-label">Tags:</span>
                  @for (tag of detectedTags(); track tag) {
                    <span class="tag-chip">#{{ tag }}</span>
                  }
                </div>
              }
              
              @if (error()) {
                <div class="error-message">{{ error() }}</div>
              }
              
              <div class="post-actions">
                <button class="btn-secondary" (click)="cancel()" [disabled]="loading()">Cancel</button>
                <button class="btn-primary" (click)="share()" [disabled]="loading()">
                  {{ loading() ? 'Sharing...' : 'Share' }}
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .create {
      position: fixed;
      top: 0;
      left: var(--nav-width);
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    @media (max-width: 1264px) {
      .create {
        left: 72px;
      }
    }

    @media (max-width: 768px) {
      .create {
        left: 0;
      }
    }

    .create-modal {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow: hidden;
    }

    .upload-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 40px;
      min-height: 450px;
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .upload-icon {
      color: var(--text-tertiary);
      margin-bottom: 24px;
      opacity: 0.5;
    }

    .upload-text {
      font-size: 20px;
      color: var(--text-primary);
      margin-bottom: 24px;
      font-weight: 300;
    }

    .upload-btn {
      padding: 14px 32px;
      background: var(--text-primary);
      color: var(--bg-primary);
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      position: relative;
      z-index: 1;
    }

    .upload-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    .upload-btn:active {
      transform: translateY(0);
    }

    .preview-area {
      display: grid;
      grid-template-columns: 1fr 340px;
      max-height: calc(90vh - 60px);
    }

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: var(--bg-secondary);
    }

    .caption-area {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      border-left: 1px solid var(--border);
    }

    .caption-area textarea {
      flex: 1;
      border: none;
      background: transparent;
      color: var(--text-primary);
      font-size: 14px;
      resize: none;
      outline: none;
    }

    .error-message {
      color: #ef4444;
      font-size: 14px;
      padding: 8px 12px;
      background: rgba(239, 68, 68, 0.1);
      border-radius: var(--radius-md);
    }

    .detected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      padding: 12px;
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
    }

    .tags-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .tag-chip {
      padding: 4px 12px;
      background: var(--accent-light);
      color: var(--accent-color);
      border-radius: var(--radius-full);
      font-size: 12px;
      font-weight: 600;
    }

    .post-actions {
      display: flex;
      gap: 12px;
    }

    .post-actions button {
      flex: 1;
      padding: 10px;
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .post-actions button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .create-modal {
        width: 100%;
        height: 100%;
        max-height: 100vh;
        border-radius: 0;
      }

      .preview-area {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr auto;
      }

      .caption-area {
        border-left: none;
        border-top: 1px solid var(--border);
      }
    }
  `]
})
export class CreateComponent {
  private router = inject(Router);
  private postService = inject(PostService);
  
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string>('');
  loading = signal(false);
  error = signal('');
  caption = '';
  detectedTags = signal<string[]>([]);

  onCaptionChange() {
    const tags = this.extractHashtags(this.caption);
    this.detectedTags.set(tags);
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  cancel() {
    this.selectedFile.set(null);
    this.previewUrl.set('');
    this.caption = '';
    this.error.set('');
  }

  goBack() {
    this.router.navigate(['/']);
  }

  async share() {
    const file = this.selectedFile();
    if (!file) {
      this.error.set('Please select an image');
      return;
    }

    try {
      this.loading.set(true);
      this.error.set('');
      
      // Extract hashtags from caption
      const hashtags = this.extractHashtags(this.caption);
      const tagsString = hashtags.join(',');
      
      await this.postService.createPost([file], this.caption, undefined, tagsString);
      
      // Success! Navigate to home
      this.router.navigate(['/']);
    } catch (err: any) {
      console.error('Failed to create post:', err);
      this.error.set(err.message || 'Failed to create post. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    if (!matches) return [];
    
    // Remove # and convert to lowercase
    return matches.map(tag => tag.substring(1).toLowerCase());
  }
}
