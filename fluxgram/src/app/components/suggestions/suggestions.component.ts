import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './suggestions.component.html',
  styleUrl: './suggestions.component.css'
})
export class SuggestionsComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  
  suggestions = this.userService.getSuggestions();
  currentUser = this.authService.getCurrentUser();
  
  // Limit to 3 suggestions
  limitedSuggestions = computed(() => {
    return this.suggestions().slice(0, 3);
  });

  ngOnInit() {
    this.userService.loadSuggestions();
  }

  async toggleFollow(user: any) {
    try {
      await this.userService.toggleFollow(user.id);
      // Reload suggestions to update the list
      await this.userService.loadSuggestions();
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  }
}
