import { Injectable, signal } from '@angular/core';
import { TapticKit } from 'taptickit';

export type HapticPattern =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection'
  | number
  | number[];

@Injectable({
  providedIn: 'root',
})
export class HapticService {
  private taptic = new TapticKit();
  private supported = signal(false);

  constructor() {
    // Check if vibration is supported (static property)
    this.supported.set(TapticKit.isSupported);
  }

  /**
   * Trigger haptic feedback
   * Must be called from a user gesture (click/tap)
   */
  trigger(pattern: HapticPattern): void {
    this.taptic.trigger(pattern);
  }

  /**
   * Quick feedback for button presses
   */
  tap(): void {
    this.trigger('light');
  }

  /**
   * Medium intensity feedback
   */
  mediumTap(): void {
    this.trigger('medium');
  }

  /**
   * Heavy feedback for important actions
   */
  heavyTap(): void {
    this.trigger('heavy');
  }

  /**
   * Success feedback for completed actions
   */
  success(): void {
    this.trigger('success');
  }

  /**
   * Error feedback for failures
   */
  error(): void {
    this.trigger('error');
  }

  /**
   * Warning feedback
   */
  warning(): void {
    this.trigger('warning');
  }

  /**
   * Selection feedback (light, good for UI selection)
   */
  selection(): void {
    this.trigger('selection');
  }

  /**
   * Check if haptic feedback is supported on this device
   */
  isSupported() {
    return this.supported.asReadonly();
  }
}
