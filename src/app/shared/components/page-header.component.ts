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
    <header
      class="sticky top-0 z-50 border-b transition-all duration-300
             bg-white/85 dark:bg-gray-950/85 backdrop-blur-lg
             border-gray-100 dark:border-gray-800"
    >
      <div class="h-[env(safe-area-inset-top)] w-full md:h-0 bg-transparent transition-all"></div>

      <div class="relative flex items-center justify-between h-14 px-4">
        
        <div class="flex items-center z-20 min-w-[48px]">
          <ion-button
            *ngIf="showBack"
            fill="clear"
            size="small"
            class="-ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full h-10 w-10"
            (click)="goBack()"
          >
            <ion-icon name="chevron-back-outline" slot="icon-only" class="text-xl"></ion-icon>
          </ion-button>
        </div>

        <div class="absolute left-0 right-0 flex justify-center items-center pointer-events-none z-10">
          <h1
            class="text-base md:text-lg font-bold truncate max-w-[60%]
                   bg-clip-text text-transparent bg-gradient-to-r 
                   from-gray-900 to-gray-600 
                   dark:from-white dark:to-gray-400"
          >
            {{ title }}
          </h1>
        </div>

        <div class="flex items-center justify-end z-20 min-w-[48px] gap-1">
          <ng-content select="[slot=end]"></ng-content>
        </div>
        
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      /* Garante que o header fique sobre o conteúdo ao rolar */
      position: relative;
      z-index: 50;
    }
  `]
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