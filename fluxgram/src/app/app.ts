import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from './components/navigation/navigation.component';
import { ConnectionStatusComponent } from './components/connection-status/connection-status.component';
import { ThemeService } from './services/theme.service';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavigationComponent, ConnectionStatusComponent],
  template: `
    <app-connection-status />
    @if (showNavigation) {
      <app-navigation />
    }
    <main class="main" [class.no-nav]="!showNavigation">
      <router-outlet />
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
    
    .main {
      margin-left: 280px;
      min-height: 100vh;
      position: relative;
      z-index: 1;
    }
    
    .main.no-nav {
      margin-left: 0;
    }
    
    @media (max-width: 1264px) {
      .main {
        margin-left: 72px;
      }
      
      .main.no-nav {
        margin-left: 0;
      }
    }
    
    @media (max-width: 768px) {
      .main {
        margin-left: 0;
        padding-bottom: 60px;
      }
      
      .main.no-nav {
        padding-bottom: 0;
      }
    }
  `]
})
export class AppComponent {
  private router = inject(Router);
  private themeService = inject(ThemeService); // Initialize theme service
  showNavigation = true;

  constructor() {
    // Theme service is now initialized
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => event as NavigationEnd)
    ).subscribe(event => {
      const authRoutes = ['/login', '/register'];
      this.showNavigation = !authRoutes.includes(event.urlAfterRedirects);
    });
    
    // Set initial state
    const authRoutes = ['/login', '/register'];
    this.showNavigation = !authRoutes.includes(this.router.url);
  }
}
