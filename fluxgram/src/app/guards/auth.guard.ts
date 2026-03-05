import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/register']);
  return false;
};

export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = authService.isAuthenticated();
  console.log('🔒 guestGuard check - isAuthenticated:', isAuth);
  console.log('📍 Current URL:', router.url);

  if (!isAuth) {
    return true;
  }

  console.log('⚠️ User is authenticated, redirecting to home');
  router.navigate(['/']);
  return false;
};
