import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private postService = inject(PostService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  currentUser = this.authService.getCurrentUser();
  user = signal<any>(null);
  loading = signal(true);
  error = signal('');
  posts = signal<any[]>([]);
  savedPosts = signal<any[]>([]);
  activeTab = signal<'posts' | 'saved' | 'tagged'>('posts');
  selectedPost = signal<any>(null);
  showEditModal = signal(false);
  editForm = signal({
    username: '',
    fullName: '',
    bio: '',
    avatar: null as File | null
  });
  editLoading = signal(false);
  editError = signal('');
  previewAvatar = signal<string>('');
  showPostMenu = signal(false);
  usernameAvailable = signal<boolean | null>(null);
  checkingUsername = signal(false);

  async ngOnInit() {
    // Get username from route or use current user
    const username = this.route.snapshot.paramMap.get('username') || this.currentUser()?.username;
    
    if (username) {
      await this.loadProfile(username);
    } else {
      // Show current user's data from auth service
      const current = this.currentUser();
      if (current) {
        this.user.set({
          id: current.id,
          username: current.username,
          fullName: current.fullName,
          avatar: current.avatar,
          bio: current.bio || '',
          posts: 0,
          followers: 0,
          following: 0,
          isFollowing: false
        });
        await this.loadUserPosts(current.username);
      }
      this.loading.set(false);
    }
    
    // Listen for edit profile event from navigation
    window.addEventListener('openEditProfile', () => {
      if (this.currentUser()?.username === this.user()?.username) {
        this.openEditModal();
      }
    });
  }

  async loadProfile(username: string) {
    try {
      this.loading.set(true);
      const profile = await this.userService.getProfile(username);
      this.user.set(profile);
      await this.loadUserPosts(profile.username);
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      this.error.set('Failed to load profile');
      // Fallback to current user data
      const current = this.currentUser();
      if (current) {
        this.user.set({
          id: current.id,
          username: current.username,
          fullName: current.fullName,
          avatar: current.avatar,
          bio: current.bio || '',
          posts: 0,
          followers: 0,
          following: 0,
          isFollowing: false
        });
        await this.loadUserPosts(current.username);
      }
    } finally {
      this.loading.set(false);
    }
  }

  async loadUserPosts(username: string) {
    try {
      const userPosts = await this.postService.getUserPosts(username);
      this.posts.set(userPosts);
      // Update post count
      this.user.update(u => u ? { ...u, posts: userPosts.length } : u);
      
      // Load saved posts if it's the current user
      if (username === this.currentUser()?.username) {
        await this.loadSavedPosts();
      }
    } catch (error) {
      console.error('Failed to load user posts:', error);
    }
  }

  async loadSavedPosts() {
    try {
      const saved = await this.postService.getSavedPosts();
      this.savedPosts.set(saved);
    } catch (error) {
      console.error('Failed to load saved posts:', error);
    }
  }

  switchTab(tab: 'posts' | 'saved' | 'tagged') {
    this.activeTab.set(tab);
  }

  async toggleFollow() {
    const userId = this.user()?.id;
    if (!userId) return;

    try {
      const result = await this.userService.toggleFollow(userId);
      this.user.update(u => u ? { ...u, isFollowing: result.isFollowing, followers: result.followers } : u);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  }

  openPost(post: any) {
    // Navigate to post detail page with return URL
    this.router.navigate(['/post', post.id], {
      state: { returnUrl: this.router.url }
    });
  }

  closePost() {
    this.selectedPost.set(null);
  }

  async likePost() {
    const post = this.selectedPost();
    if (!post) return;
    
    await this.postService.likePost(post.id);
    // Update the selected post
    const updatedPosts = await this.postService.getUserPosts(this.user()!.username);
    this.posts.set(updatedPosts);
    const updatedPost = updatedPosts.find(p => p.id === post.id);
    if (updatedPost) {
      this.selectedPost.set(updatedPost);
    }
  }

  savePost() {
    const post = this.selectedPost();
    if (!post) return;
    
    this.postService.savePost(post.id);
    
    // Update the selected post
    const allPosts = this.postService.getPosts()();
    const updatedPost = allPosts.find(p => p.id === post.id);
    if (updatedPost) {
      this.selectedPost.set(updatedPost);
    }
    
    // Reload saved posts
    this.loadSavedPosts();
  }

  togglePostMenu() {
    this.showPostMenu.update(v => !v);
  }

  closePostMenu() {
    this.showPostMenu.set(false);
  }

  isOwnPost(post: any): boolean {
    const currentUserId = this.currentUser()?.id;
    const postUserId = post.userId;
    console.log('Checking ownership:', { currentUserId, postUserId, match: currentUserId === postUserId });
    return currentUserId === postUserId;
  }

  async deleteSelectedPost() {
    const post = this.selectedPost();
    if (!post) return;

    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await this.postService.deletePost(post.id);
      this.closePost();
      this.closePostMenu();
      // Reload posts
      await this.loadUserPosts(this.user()!.username);
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    }
  }

  openEditModal() {
    const current = this.user();
    if (current) {
      this.editForm.set({
        username: current.username || '',
        fullName: current.fullName || '',
        bio: current.bio || '',
        avatar: null
      });
      this.previewAvatar.set(current.avatar || '');
      this.usernameAvailable.set(null);
    }
    this.showEditModal.set(true);
    this.editError.set('');
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editForm.set({ username: '', fullName: '', bio: '', avatar: null });
    this.previewAvatar.set('');
    this.editError.set('');
    this.usernameAvailable.set(null);
  }
  
  async checkUsernameAvailability(username: string) {
    const currentUsername = this.user()?.username;
    
    // If username hasn't changed, it's available
    if (username === currentUsername) {
      this.usernameAvailable.set(true);
      return;
    }
    
    // Basic validation
    if (!username) {
      this.usernameAvailable.set(null);
      return;
    }
    
    // Check if username contains only valid characters
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    if (!usernameRegex.test(username)) {
      this.usernameAvailable.set(false);
      return;
    }
    
    try {
      this.checkingUsername.set(true);
      const available = await this.userService.checkUsernameAvailability(username);
      this.usernameAvailable.set(available);
    } catch (error) {
      console.error('Failed to check username:', error);
      this.usernameAvailable.set(null);
    } finally {
      this.checkingUsername.set(false);
    }
  }
  
  onUsernameChange(username: string) {
    this.editForm.update(form => ({ ...form, username }));
    // Debounce username check
    clearTimeout((this as any).usernameCheckTimeout);
    (this as any).usernameCheckTimeout = setTimeout(() => {
      this.checkUsernameAvailability(username);
    }, 500);
  }

  onAvatarSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.editError.set('Please select an image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.editError.set('Image size must be less than 5MB');
        return;
      }
      
      this.editForm.update(form => ({ ...form, avatar: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewAvatar.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      this.editError.set('');
    }
  }

  async saveProfile() {
    const form = this.editForm();
    const userId = this.user()?.id;
    
    if (!userId) return;

    if (!form.username.trim()) {
      this.editError.set('Username is required');
      return;
    }
    
    if (!form.fullName.trim()) {
      this.editError.set('Full name is required');
      return;
    }
    
    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    if (!usernameRegex.test(form.username)) {
      this.editError.set('Username can only contain letters, numbers, dots, and underscores');
      return;
    }
    
    // Check if username is available
    if (form.username !== this.user()?.username && this.usernameAvailable() !== true) {
      // Don't set editError here, the field hint already shows the error
      return;
    }

    try {
      this.editLoading.set(true);
      this.editError.set('');

      const updateData: any = {
        username: form.username,
        fullName: form.fullName,
        bio: form.bio
      };

      if (form.avatar) {
        updateData.avatar = form.avatar;
      }

      await this.userService.updateProfile(userId, updateData);

      // Update local user data
      this.user.update(u => u ? {
        ...u,
        username: form.username,
        fullName: form.fullName,
        bio: form.bio,
        avatar: this.previewAvatar() || u.avatar
      } : u);

      // Update auth service user data
      const currentUser = this.currentUser();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          username: form.username,
          fullName: form.fullName,
          bio: form.bio,
          avatar: this.previewAvatar() || currentUser.avatar
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      this.closeEditModal();
      
      // If username changed, navigate to new profile URL
      if (form.username !== this.currentUser()?.username) {
        this.router.navigate(['/profile', form.username]);
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      this.editError.set(err.message || 'Failed to update profile');
    } finally {
      this.editLoading.set(false);
    }
  }
}
