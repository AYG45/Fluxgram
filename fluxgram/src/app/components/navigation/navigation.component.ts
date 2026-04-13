import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { HapticService } from '../../services/haptic.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private haptic = inject(HapticService);
  
  notifications = this.notificationService.getNotifications();
  
  unreadCount = computed(() => {
    const count = this.notifications().filter(n => !n.read).length;
    return count > 0 ? count : undefined;
  });

  navItems = [
    { icon: 'home', label: 'Home', route: '/' },
    { icon: 'search', label: 'Explore', route: '/explore' },
    { icon: 'plus', label: 'Create', route: '/create' },
    { icon: 'bell', label: 'Notifications', route: '/notifications' },
    { icon: 'user', label: 'Profile', route: '/profile' }
  ];
  
  showMenu = signal(false);

  toggleMenu() {
    this.showMenu.update(v => !v);
    this.haptic.selection();
  }
  
  closeMenu() {
    this.showMenu.set(false);
  }
  
  toggleTheme() {
    this.haptic.selection();
    this.themeService.toggleTheme();
    this.closeMenu();
  }
  
  logout() {
    this.haptic.selection();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  editProfile() {
    this.haptic.selection();
    const currentUser = this.authService.getCurrentUser();
    const currentRoute = this.router.url;
    
    // If already on profile page, just dispatch the event
    if (currentRoute === '/profile' || currentRoute === `/profile/${currentUser()?.username}`) {
      window.dispatchEvent(new CustomEvent('openEditProfile'));
      this.closeMenu();
    } else {
      // Navigate to profile first, then open edit modal
      this.router.navigate(['/profile']).then(() => {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('openEditProfile'));
        }, 100);
      });
      this.closeMenu();
    }
  }

  async ngOnInit() {
    await this.notificationService.loadNotifications();

    // Refresh notifications every 30 seconds
    setInterval(() => {
      this.notificationService.loadNotifications();
    }, 30000);
  }

  onNavClick() {
    // Minimal haptic feedback for nav switching (lighter than tap)
    this.haptic.selection();
  }
}
