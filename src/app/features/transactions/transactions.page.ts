import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { TransactionService } from '../../core/services/transaction.service';
import { Observable } from 'rxjs';
import { Transaction } from '../../core/models/transaction.model';
import { addIcons } from 'ionicons';
import { addOutline, funnelOutline } from 'ionicons/icons';
import { AddTransactionModalComponent } from './components/add-transaction-modal.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent],
  template: `
    <app-page-header title="Transactions">
      <div slot="end">
        <ion-button fill="clear">
          <ion-icon
            name="funnel-outline"
            slot="icon-only"
            class="text-gray-600 dark:text-gray-300"
          ></ion-icon>
        </ion-button>
      </div>
    </app-page-header>

    <ion-content class="bg-gray-50 dark:bg-gray-900">
      <ion-list class="bg-transparent">
        <ion-item
          *ngFor="let t of transactions$ | async"
          class="bg-transparent"
          lines="full"
        >
          <ion-label>
            <h2 class="font-semibold text-gray-800 dark:text-white">
              {{ t.note || 'Transaction' }}
            </h2>
            <p class="text-gray-500">{{ t.date | date: 'shortDate' }}</p>
          </ion-label>
          <ion-note
            slot="end"
            [color]="t.type === 'income' ? 'success' : 'danger'"
            class="font-bold text-base"
          >
            {{ t.type === 'income' ? '+' : '-' }}{{ t.amount | currency }}
          </ion-note>
        </ion-item>
      </ion-list>

      <ion-fab
        vertical="bottom"
        horizontal="end"
        slot="fixed"
        class="mb-16 mr-2"
      >
        <ion-fab-button (click)="openAddModal()" color="primary">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [
    `
      ion-item {
        --background: transparent;
        --border-color: #f3f4f6;
      }
      @media (prefers-color-scheme: dark) {
        ion-item {
          --border-color: #374151;
        }
      }
    `,
  ],
})
export class TransactionsPage implements OnInit {
  transactions$: Observable<Transaction[]>;

  constructor(
    private transactionService: TransactionService,
    private modalCtrl: ModalController,
  ) {
    addIcons({ addOutline, funnelOutline });
    this.transactions$ = this.transactionService.transactions$;
  }

  ngOnInit() {}

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: AddTransactionModalComponent,
    });
    await modal.present();
  }
}
