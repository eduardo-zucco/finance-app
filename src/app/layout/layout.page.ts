import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  swapHorizontalOutline,
  walletOutline,
  pieChartOutline,
  trophyOutline,
  addCircleOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-tabs>
      <ion-tab-bar
        slot="bottom"
        class="custom-tab-bar border-t border-gray-100 dark:border-gray-800 h-16 pb-1"
      >
        <ion-tab-button tab="dashboard" href="/dashboard">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="transactions" href="/transactions">
          <ion-icon name="swap-horizontal-outline"></ion-icon>
          <ion-label>Trans.</ion-label>
        </ion-tab-button>

        <!-- Centered Add Button Style Placeholder - functionality would essentially be a modal -->
        <!-- For now just a tab, but we can make it special later -->

        <ion-tab-button tab="accounts" href="/accounts">
          <ion-icon name="wallet-outline"></ion-icon>
          <ion-label>Accounts</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="budgets" href="/budgets">
          <ion-icon name="pie-chart-outline"></ion-icon>
          <ion-label>Budgets</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="goals" href="/goals">
          <ion-icon name="trophy-outline"></ion-icon>
          <ion-label>Goals</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [
    `
      ion-tab-bar {
        --background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
      }
      @media (prefers-color-scheme: dark) {
        ion-tab-bar {
          --background: rgba(17, 24, 39, 0.9);
        }
      }
      ion-tab-button {
        --color-selected: #4f46e5; /* Indigo 600 */
        --color: #9ca3af; /* Gray 400 */
      }
    `,
  ],
})
export class LayoutPage {
  constructor() {
    addIcons({
      homeOutline,
      swapHorizontalOutline,
      walletOutline,
      pieChartOutline,
      trophyOutline,
      addCircleOutline,
    });
  }
}
