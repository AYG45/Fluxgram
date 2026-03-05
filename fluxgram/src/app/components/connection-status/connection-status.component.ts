import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-connection-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!connected()) {
      <div class="connection-banner">
        <span class="icon">⚠️</span>
        <span class="message">Backend not connected - using mock data</span>
        <button class="retry-btn" (click)="checkConnection()">Retry</button>
      </div>
    }
  `,
  styles: [`
    .connection-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
      color: white;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      z-index: 9999;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .icon {
      font-size: 18px;
    }

    .retry-btn {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 6px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s;
    }

    .retry-btn:hover {
      background: rgba(255,255,255,0.3);
    }
  `]
})
export class ConnectionStatusComponent implements OnInit {
  connected = signal(true);

  ngOnInit() {
    this.checkConnection();
    // Check every 30 seconds
    setInterval(() => this.checkConnection(), 30000);
  }

  async checkConnection() {
    try {
      const response = await fetch('http://localhost:3000/api/health');
      this.connected.set(response.ok);
    } catch (error) {
      this.connected.set(false);
    }
  }
}
