import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  gridOutline,
  swapHorizontalOutline,
  walletOutline,
  pieChartOutline,
  trophyOutline,
  logOutOutline,
  personCircleOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  template: `
    <ion-app>
      <ion-split-pane contentId="main-content" when="md">
        <ion-menu
          contentId="main-content"
          type="overlay"
          class="border-r border-gray-100 dark:border-gray-800"
        >
          <div class="flex flex-col h-full bg-white dark:bg-gray-950">
            <div class="p-8 pb-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  F
                </div>
                <h1
                  class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight"
                >
                  FindDash
                </h1>
              </div>
            </div>

            <ion-content class="ion-no-padding custom-scrollbar">
              <div class="px-4 py-2 space-y-1">
                <p
                  class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4"
                >
                  Menu Principal
                </p>

                <ng-container *ngFor="let item of menuItems">
                  <div
                    [routerLink]="item.path"
                    routerDirection="root"
                    routerLinkActive="bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 font-semibold"
                    class="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all cursor-pointer group"
                  >
                    <ion-icon
                      [name]="item.icon"
                      class="text-xl group-hover:scale-110 transition-transform"
                    ></ion-icon>
                    <span>{{ item.label }}</span>
                  </div>
                </ng-container>
              </div>
            </ion-content>

            <div class="p-4 border-t border-gray-100 dark:border-gray-800">
              <div
                class="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 mb-2"
              >
                <ion-icon
                  name="person-circle-outline"
                  class="text-3xl text-gray-400"
                ></ion-icon>
                <div class="flex-1 min-w-0">
                  <p
                    class="text-sm font-semibold text-gray-900 dark:text-white truncate"
                  >
                    Usuário Demo
                  </p>
                  <p class="text-xs text-gray-500 truncate">
                    user@finddash.com
                  </p>
                </div>
              </div>
              <button
                class="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <ion-icon name="log-out-outline"></ion-icon>
                Sair
              </button>
            </div>
          </div>
        </ion-menu>

        <div class="ion-page" id="main-content">
          <ion-router-outlet></ion-router-outlet>
        </div>
      </ion-split-pane>
    </ion-app>
  `,
  styles: [
    `
      ion-menu {
        --width: 280px;
      }
      .custom-scrollbar::-webkit-scrollbar {
        display: none;
      }
    `,
  ],
})
export class AppComponent {
  menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'grid-outline' },
    {
      label: 'Transações',
      path: '/transactions',
      icon: 'swap-horizontal-outline',
    },
    { label: 'Contas', path: '/accounts', icon: 'wallet-outline' },
    { label: 'Orçamentos', path: '/budgets', icon: 'pie-chart-outline' },
    { label: 'Metas', path: '/goals', icon: 'trophy-outline' },
  ];

  constructor() {
    addIcons({
      gridOutline,
      swapHorizontalOutline,
      walletOutline,
      pieChartOutline,
      trophyOutline,
      logOutOutline,
      personCircleOutline,
    });
  }
}
