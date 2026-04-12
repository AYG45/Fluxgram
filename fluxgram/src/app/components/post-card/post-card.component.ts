import { Component, Input, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { HapticService } from '../../services/haptic.service';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.css'
})
export class PostCardComponent {
  @Input({ required: true }) post!: Post;
  @Input() showDeleteOption = false; // Only show delete on profile page
  
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private haptic = inject(HapticService);
  private lastTap = 0;
  
  showMenu = signal(false);
  currentUser = this.authService.getCurrentUser();

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.post-header')) {
      this.showMenu.set(false);
    }
  }

  isOwnPost() {
    return this.currentUser()?.id === this.post.userId;
  }

  toggleMenu() {
    this.showMenu.update(v => !v);
    this.haptic.tap();
  }

  closeMenu() {
    this.showMenu.set(false);
  }

  async onDelete() {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    this.haptic.heavyTap();
    try {
      await this.postService.deletePost(this.post.id);
      this.closeMenu();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    }
  }

  onLike() {
    this.postService.likePost(this.post.id);
    this.haptic.success();
  }

  onSave() {
    this.postService.savePost(this.post.id);
    this.haptic.mediumTap();
  }

  openPostDetail(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    // Navigate with state containing the current URL
    this.router.navigate(['/post', this.post.id], {
      state: { returnUrl: this.router.url }
    });
  }

  onImageClick(event: MouseEvent) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - this.lastTap;
    
    // Double click/tap detected (within 300ms)
    if (tapLength < 300 && tapLength > 0) {
      // Toggle like/unlike
      this.onLike();
      this.haptic.success();
      this.showLikeAnimation(event);
      event.preventDefault();
    }
    
    this.lastTap = currentTime;
  }

  private showLikeAnimation(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const heart = document.createElement('div');
    heart.className = 'like-animation-heart';
    heart.innerHTML = `
      <svg viewBox="0 0 24 24" width="100" height="100" fill="#ed4956">
        <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938Z"/>
      </svg>
    `;
    
    target.style.position = 'relative';
    target.appendChild(heart);
    
    // Trigger animation
    setTimeout(() => {
      heart.classList.add('active');
    }, 10);
    
    // Remove after animation
    setTimeout(() => {
      heart.remove();
    }, 800);
  }
}
