import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  gridOutline,
  swapHorizontalOutline,
  addCircle,
  walletOutline,
  pieChartOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom" class="border-t border-gray-100 dark:border-gray-800">
        <ion-tab-button tab="dashboard" href="/dashboard">
          <ion-icon name="grid-outline"></ion-icon>
          <ion-label>Início</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="transactions" href="/transactions">
          <ion-icon name="swap-horizontal-outline"></ion-icon>
          <ion-label>Extrato</ion-label>
        </ion-tab-button>

        <ion-tab-button class="add-button-wrapper" (click)="openAddModal()">
          <div class="bg-indigo-600 rounded-full p-1 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transform -translate-y-4">
            <ion-icon name="add-circle" class="text-5xl text-white"></ion-icon>
          </div>
        </ion-tab-button>

        <ion-tab-button tab="accounts" href="/accounts">
          <ion-icon name="wallet-outline"></ion-icon>
          <ion-label>Carteira</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="budgets" href="/budgets">
          <ion-icon name="pie-chart-outline"></ion-icon>
          <ion-label>Planos</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [`
    ion-tab-bar {
      --background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      height: 60px;
      padding-bottom: env(safe-area-inset-bottom);
    }

    ion-tab-button {
      --color: #9ca3af;
      --color-selected: #4f46e5;
    }

    /* Oculta abas no desktop, pois o sidebar será usado */
    @media (min-width: 768px) {
      ion-tab-bar {
        display: none;
      }
    }

    /* Estilo especial para o botão do meio */
    .add-button-wrapper ion-icon {
      margin-bottom: 0;
    }
  `]
})
export class LayoutPage {
  constructor() {
    addIcons({ gridOutline, swapHorizontalOutline, addCircle, walletOutline, pieChartOutline });
  }

  openAddModal() {
    console.log('Abrir modal de nova transação');
  }
}