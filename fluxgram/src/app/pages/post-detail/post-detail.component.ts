import { Component, signal, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css'
})
export class PostDetailComponent implements OnInit {
  @ViewChild('commentInput') commentInput!: ElementRef<HTMLInputElement>;
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private postService = inject(PostService);
  private authService = inject(AuthService);
  
  postId = '';
  post = signal<any>(null);
  comments = signal<any[]>([]);
  commentText = '';
  currentUser = this.authService.getCurrentUser();
  private lastTap = 0;
  showEmojiPicker = false;
  private returnUrl: string | null = null;
  
  emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
    '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
    '🤧', '🥵', '🥶', '😶‍🌫️', '🥴', '😵', '🤯', '🤠', '🥳', '😎',
    '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳',
    '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖',
    '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬',
    '👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤞',
    '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚',
    '🖐', '✋', '🖖', '💪', '🦾', '🖕', '✍️', '🤳', '💅', '🦵',
    '🦿', '🦶', '👄', '🦷', '👅', '👂', '🦻', '👃', '👣', '👁',
    '👀', '🧠', '🦴', '💀', '☠️', '👶', '👧', '🧒', '👦', '👩',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
    '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
    '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌈', '☀️', '🌤',
    '⛅', '🌥', '☁️', '🌦', '🌧', '⛈', '🌩', '🌨', '❄️', '☃️',
    '⛄', '🌬', '💨', '💧', '💦', '☔', '🌊', '🌫'
  ];

  ngOnInit() {
    // Capture the return URL from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['returnUrl']) {
      this.returnUrl = navigation.extras.state['returnUrl'];
    } else if (window.history.state?.returnUrl) {
      this.returnUrl = window.history.state.returnUrl;
    }
    
    this.route.params.subscribe(params => {
      const newPostId = params['id'];
      
      // Always reload when params change
      this.postId = newPostId;
      this.post.set(null); // Reset post
      this.comments.set([]); // Reset comments
      this.commentText = ''; // Reset input
      
      // Load data
      this.loadPost();
      this.loadComments();
    });
  }

  async loadPost() {
    try {
      const post = await this.postService.getPostById(this.postId);
      if (post) {
        this.post.set(post);
      } else {
        console.error('Post not found');
      }
    } catch (error) {
      console.error('Failed to load post:', error);
    }
  }

  async loadComments() {
    if (!this.postId) {
      return;
    }
    
    try {
      const comments = await this.postService.getComments(this.postId);
      this.comments.set(comments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  }

  async submitComment() {
    if (!this.commentText.trim()) return;

    try {
      await this.postService.addComment(this.postId, this.commentText.trim());
      this.commentText = '';
      await this.loadComments();
      
      // Update post comment count
      const currentPost = this.post();
      if (currentPost) {
        this.post.set({ ...currentPost, comments: currentPost.comments + 1 });
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  }

  async deleteComment(commentId: string) {
    if (!confirm('Delete this comment?')) {
      return;
    }

    try {
      await this.postService.deleteComment(this.postId, commentId);
      await this.loadComments();
      
      // Update post comment count
      const currentPost = this.post();
      if (currentPost) {
        this.post.set({ ...currentPost, comments: Math.max(0, currentPost.comments - 1) });
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  }

  async toggleLike() {
    const currentPost = this.post();
    if (!currentPost) return;

    try {
      await this.postService.likePost(currentPost.id);
      // Reload post to get updated like status
      await this.loadPost();
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  }

  async toggleSave() {
    const currentPost = this.post();
    if (!currentPost) return;
    
    // Optimistic update
    const newSavedState = !currentPost.isSaved;
    this.post.set({ ...currentPost, isSaved: newSavedState });
    
    try {
      await this.postService.savePost(currentPost.id);
    } catch (error) {
      console.error('Failed to toggle save:', error);
      // Revert on error
      this.post.set({ ...currentPost, isSaved: !newSavedState });
    }
  }

  isOwnPost() {
    const currentPost = this.post();
    if (!currentPost) return false;
    return this.currentUser()?.id === currentPost.userId;
  }

  async deletePost() {
    const currentPost = this.post();
    if (!currentPost || !this.isOwnPost()) return;

    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await this.postService.deletePost(currentPost.id);
      // Navigate back after deletion using Angular's Location service
      this.closeModal();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    }
  }

  async downloadPost() {
    const currentPost = this.post();
    if (!currentPost) return;

    try {
      const imageUrl = currentPost.images[0];
      // Add download=true query parameter to trigger Content-Disposition header
      const downloadUrl = imageUrl.includes('?') 
        ? `${imageUrl}&download=true` 
        : `${imageUrl}?download=true`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `fluxgram-${currentPost.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download image:', error);
      alert('Failed to download image. Please try again.');
    }
  }

  closeModal() {
    // Use the stored return URL if available
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      // Fallback to location.back()
      this.location.back();
    }
  }

  formatLikes(count: number): string {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  }

  getTimeAgo(date: string | Date): string {
    const now = new Date();
    const postDate = new Date(date);
    const seconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  }

  onImageDoubleClick(event: MouseEvent) {
    // Toggle like
    if (!this.post()?.isLiked) {
      this.toggleLike();
    }
    
    // Show heart animation
    const heartElement = document.querySelector('.heart-animation') as HTMLElement;
    if (heartElement) {
      heartElement.classList.add('active');
      setTimeout(() => {
        heartElement.classList.remove('active');
      }, 600);
    }
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(emoji: string) {
    this.commentText += emoji;
    this.showEmojiPicker = false;
    // Focus back on input
    setTimeout(() => {
      if (this.commentInput) {
        this.commentInput.nativeElement.focus();
      }
    }, 0);
  }
}
