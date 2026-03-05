import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDark = signal(false);

  constructor() {
    // Initialize theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('theme');
    
    // Default to dark mode if no saved preference
    const shouldBeDark = savedTheme === 'light' ? false : true;
    this.isDark.set(shouldBeDark);
    this.applyTheme(shouldBeDark);

    // Watch for theme changes and apply them
    effect(() => {
      this.applyTheme(this.isDark());
    });
  }

  toggleTheme() {
    this.isDark.update(v => !v);
    localStorage.setItem('theme', this.isDark() ? 'dark' : 'light');
  }

  private applyTheme(isDark: boolean) {
    if (isDark) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }
  }
}
