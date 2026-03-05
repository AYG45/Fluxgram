import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface RegisterData {
  email: string;
  fullName: string;
  username: string;
  password: string;
  avatar?: File;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatar?: string;
  bio?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);
  private apiUrl = environment.apiUrl;

  constructor(private router: Router) {
    this.loadUserFromStorage();
  }

  getCurrentUser() {
    return this.currentUser.asReadonly();
  }

  isAuthenticated() {
    return !!this.token();
  }

  async register(data: RegisterData): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('fullName', data.fullName);
      formData.append('username', data.username);
      formData.append('password', data.password);
      
      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }

      const response = await fetch(`${this.apiUrl}/auth/register`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const result = await response.json();
      
      // Save to localStorage first
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      // Then update signals
      this.token.set(result.token);
      this.currentUser.set(result.user);
      
      console.log('✅ Registration successful, token saved:', result.token);
      
      return Promise.resolve();
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      return Promise.reject(error);
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const result = await response.json();
      
      this.token.set(result.token);
      this.currentUser.set(result.user);
      
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      return Promise.resolve();
    } catch (error: any) {
      return Promise.reject(error);
    }
  }

  logout() {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      this.token.set(token);
      this.currentUser.set(JSON.parse(userStr));
    }
  }
}
