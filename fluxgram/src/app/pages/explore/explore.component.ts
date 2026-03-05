import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="explore">
      <!-- Search Section -->
      <div class="search-section">
        <div class="search-bar">
          <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search users, tags, or posts" 
            [(ngModel)]="searchQuery"
            (input)="onSearchInput()"
            (focus)="showSearchResults.set(true)"
          >
          @if (searchQuery) {
            <button class="clear-btn" (click)="clearSearch()">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          }
        </div>

        @if (showSearchResults() && searchResults().length > 0) {
          <div class="search-dropdown">
            @for (result of searchResults(); track result.tag) {
              <div class="search-result-item" (click)="selectTag(result.tag)">
                <span class="tag-hash">#</span>
                <div class="tag-info">
                  <div class="tag-name">{{ result.tag }}</div>
                  <div class="tag-count">{{ result.count }} posts</div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      @if (loading()) {
        <div class="loading-grid">
          @for (i of [1,2,3,4,5,6,7,8,9,10,11,12]; track i) {
            <div class="skeleton-item"></div>
          }
        </div>
      } @else if (explorePosts().length === 0) {
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
          @if (activeTag()) {
            <h3>No posts found</h3>
            <p>No posts with #{{ activeTag() }} tag</p>
          } @else {
            <h3>No Posts to Explore</h3>
            <p>Follow people or wait for others to post!</p>
          }
        </div>
      } @else {
        <div class="explore-grid">
          @for (post of explorePosts(); track post.id) {
            <div class="grid-item" (click)="openPost(post)">
              <img [src]="post.images[0]" [alt]="post.caption">
              <div class="hover-overlay">
                <div class="overlay-stats">
                  <span class="stat">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {{ post.likes }}
                  </span>
                  <span class="stat">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    {{ post.comments }}
                  </span>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .explore {
      min-height: 100vh;
      padding: 32px 24px;
    }

    /* Search Section */
    .search-section {
      position: relative;
      margin-bottom: 32px;
      max-width: 100%;
    }

    .search-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 24px;
      transition: all 0.2s;
    }

    .search-bar:focus-within {
      border-color: var(--text-primary);
      box-shadow: 0 0 0 1px var(--text-primary);
    }

    .search-icon {
      color: var(--text-secondary);
      flex-shrink: 0;
    }

    .search-bar input {
      flex: 1;
      border: none;
      background: transparent;
      color: var(--text-primary);
      font-size: 15px;
      outline: none;
    }

    .search-bar input::placeholder {
      color: var(--text-secondary);
    }

    .clear-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s;
    }

    .clear-btn:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }

    .search-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      right: 0;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 12px;
      max-height: 300px;
      overflow-y: auto;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      z-index: 100;
    }

    .search-result-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 20px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .search-result-item:hover {
      background: var(--bg-tertiary);
    }

    .tag-hash {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .tag-info {
      flex: 1;
    }

    .tag-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 15px;
    }

    .tag-count {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 2px;
    }

    /* Loading State */
    .loading-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .skeleton-item {
      aspect-ratio: 1;
      background: linear-gradient(
        90deg,
        var(--bg-secondary) 0%,
        var(--bg-tertiary) 50%,
        var(--bg-secondary) 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: 8px;
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

    .empty-icon {
      color: var(--text-tertiary);
      margin-bottom: 24px;
      opacity: 0.3;
    }

    .empty-state h3 {
      color: var(--text-primary);
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .empty-state p {
      color: var(--text-secondary);
      font-size: 15px;
    }

    /* Explore Grid */
    .explore-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .grid-item {
      position: relative;
      aspect-ratio: 1;
      cursor: pointer;
      overflow: hidden;
      border-radius: 8px;
      background: var(--bg-secondary);
    }

    .grid-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .grid-item:hover img {
      transform: scale(1.05);
    }

    .hover-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .grid-item:hover .hover-overlay {
      opacity: 1;
    }

    .overlay-stats {
      display: flex;
      gap: 32px;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      font-weight: 600;
      font-size: 16px;
    }

    .stat svg {
      flex-shrink: 0;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .explore-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 12px;
      }
    }

    @media (max-width: 768px) {
      .explore {
        padding: 16px 12px;
        padding-bottom: 80px;
      }

      .search-section {
        margin-bottom: 16px;
      }

      .explore-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }

      .grid-item {
        border-radius: 4px;
      }

      .overlay-stats {
        gap: 24px;
      }

      .stat {
        font-size: 14px;
      }
    }

    @media (max-width: 480px) {
      .explore-grid {
        gap: 4px;
      }

      .grid-item {
        border-radius: 2px;
      }
    }
  `]
})
export class ExploreComponent implements OnInit {
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  currentUser = this.authService.getCurrentUser();
  searchQuery = '';
  explorePosts = signal<any[]>([]);
  loading = signal(true);
  selectedPost = signal<any>(null);
  searchResults = signal<{ tag: string; count: number }[]>([]);
  showSearchResults = signal(false);
  activeTag = signal<string | null>(null);
  searchTimeout: any = null;

  async ngOnInit() {
    await this.loadExplorePosts();
  }

  onSearchInput() {
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    const query = this.searchQuery.trim();

    // If empty, show all posts
    if (!query) {
      this.showSearchResults.set(false);
      this.activeTag.set(null);
      this.loadExplorePosts();
      return;
    }

    // Show search results dropdown
    this.showSearchResults.set(true);

    // Debounce search
    this.searchTimeout = setTimeout(async () => {
      if (query.startsWith('#')) {
        // Search for tags
        const tagQuery = query.substring(1);
        const tags = await this.postService.searchTags(tagQuery);
        this.searchResults.set(tags);
      } else {
        // Search for tags without #
        const tags = await this.postService.searchTags(query);
        this.searchResults.set(tags);
      }
    }, 300);
  }

  async selectTag(tag: string) {
    this.searchQuery = `#${tag}`;
    this.showSearchResults.set(false);
    this.activeTag.set(tag);
    await this.searchByTag(tag);
  }

  async searchByTag(tag: string) {
    try {
      this.loading.set(true);
      const posts = await this.postService.searchPostsByTag(tag);
      this.explorePosts.set(posts);
    } catch (error) {
      console.error('Failed to search by tag:', error);
    } finally {
      this.loading.set(false);
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.showSearchResults.set(false);
    this.activeTag.set(null);
    this.loadExplorePosts();
  }

  async loadExplorePosts() {
    try {
      this.loading.set(true);
      const posts = await this.postService.loadExplorePosts();
      this.explorePosts.set(posts);
    } catch (error) {
      console.error('Failed to load explore posts:', error);
    } finally {
      this.loading.set(false);
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
    const allPosts = this.postService.getPosts()();
    const updatedPost = allPosts.find(p => p.id === post.id);
    if (updatedPost) {
      this.selectedPost.set(updatedPost);
      // Update explore posts
      this.explorePosts.update(posts =>
        posts.map(p => p.id === post.id ? updatedPost : p)
      );
    }
  }
}
