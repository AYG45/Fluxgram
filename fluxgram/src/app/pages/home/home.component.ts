import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { StoryBarComponent } from '../../components/story-bar/story-bar.component';
import { SuggestionsComponent } from '../../components/suggestions/suggestions.component';
import { HorizontalSuggestionsComponent } from '../../components/horizontal-suggestions/horizontal-suggestions.component';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, PostCardComponent, StoryBarComponent, SuggestionsComponent, HorizontalSuggestionsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private postService = inject(PostService);
  posts = this.postService.getPosts();
  loading = this.postService.isLoading();

  async refresh() {
    await this.postService.loadPosts();
  }
}
