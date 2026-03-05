import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  activeSection = signal('edit');

  profile = {
    avatar: 'https://picsum.photos/seed/fluxuser/300/300',
    username: 'fluxuser',
    name: 'Flux User',
    website: 'fluxgram.app',
    bio: '📸 Photography enthusiast\n🌍 Travel lover\n💻 Developer by day',
    email: 'user@fluxgram.app',
    phone: '',
    gender: 'Prefer not to say'
  };

  menuItems = [
    { id: 'edit', label: 'Edit profile', icon: 'user' },
    { id: 'password', label: 'Change password', icon: 'lock' },
    { id: 'privacy', label: 'Privacy and security', icon: 'shield' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'help', label: 'Help', icon: 'help' },
  ];

  setSection(id: string) {
    this.activeSection.set(id);
  }
}
