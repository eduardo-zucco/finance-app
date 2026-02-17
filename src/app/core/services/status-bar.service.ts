import { Injectable } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class StatusBarService {
  constructor(private platform: Platform) {}

  async init() {
    if (this.platform.is('capacitor')) {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        // Set default background to match dark theme background
        await StatusBar.setBackgroundColor({ color: '#0f172a' });
      } catch (e) {
        console.warn('StatusBar not available', e);
      }
    }
  }

  async setStyle(style: Style) {
    if (this.platform.is('capacitor')) {
      await StatusBar.setStyle({ style });
    }
  }

  async setBackgroundColor(color: string) {
    if (this.platform.is('capacitor')) {
      await StatusBar.setBackgroundColor({ color });
    }
  }
}
