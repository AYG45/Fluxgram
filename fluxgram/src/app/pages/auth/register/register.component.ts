import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  email = '';
  fullName = '';
  username = '';
  password = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  error = signal('');
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.error.set('Please select an image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error.set('Image size must be less than 5MB');
        return;
      }
      
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  async onSubmit() {
    if (!this.email || !this.fullName || !this.username || !this.password) {
      this.error.set('Please fill in all fields');
      return;
    }

    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      const registerData: any = {
        email: this.email,
        fullName: this.fullName,
        username: this.username,
        password: this.password
      };
      
      if (this.selectedFile) {
        registerData.avatar = this.selectedFile;
      }
      
      await this.authService.register(registerData);
      
      // Small delay to ensure token is saved
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Navigating to home...');
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error.set(err.message || 'Registration failed');
    } finally {
      this.loading.set(false);
    }
  }
}
