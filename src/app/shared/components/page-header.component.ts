import { Component, Input } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chevronBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div
      class="px-4 pt-12 pb-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300"
    >
      <div class="flex items-center justify-between">
        <!-- Left: Back Button or Spacer -->
        <div class="flex items-center w-12">
          <ion-button
            *ngIf="showBack"
            fill="clear"
            color="dark"
            (click)="goBack()"
            class="-ml-3"
          >
            <ion-icon
              name="chevron-back-outline"
              slot="icon-only"
              class="text-2xl text-gray-800 dark:text-white"
            ></ion-icon>
          </ion-button>
        </div>

        <!-- Center: Title -->
        <div class="text-center flex-1">
          <h1
            class="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
          >
            {{ title }}
          </h1>
        </div>

        <!-- Right: Actions Slot -->
        <div class="flex items-center justify-end w-12">
          <ng-content select="[slot=end]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() showBack: boolean = false;

  constructor(private location: Location) {
    addIcons({ chevronBackOutline });
  }

  goBack() {
    this.location.back();
  }
}
