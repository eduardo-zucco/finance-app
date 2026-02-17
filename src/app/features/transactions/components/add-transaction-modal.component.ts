import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../core/services/transaction.service';
import { CategoryService } from '../../../core/services/category.service';
import { AccountService } from '../../../core/services/account.service';
import { TransactionType } from '../../../core/models/transaction.model';
import { Account } from '../../../core/models/account.model';
import { Category } from '../../../core/models/category.model';
import { Observable } from 'rxjs';
import { addIcons } from 'ionicons';
import { closeOutline, checkmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-add-transaction-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Add Transaction</ion-title>
        <ion-buttons slot="end">
          <ion-button
            (click)="save()"
            [disabled]="!amount || !selectedAccountId || !selectedCategoryId"
          >
            <ion-icon name="checkmark-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-segment [(ngModel)]="type" class="mb-4">
        <ion-segment-button value="expense">
          <ion-label>Expense</ion-label>
        </ion-segment-button>
        <ion-segment-button value="income">
          <ion-label>Income</ion-label>
        </ion-segment-button>
        <ion-segment-button value="transfer">
          <ion-label>Transfer</ion-label>
        </ion-segment-button>
      </ion-segment>

      <ion-list>
        <ion-item>
          <ion-label position="stacked">Amount</ion-label>
          <ion-input
            type="number"
            [(ngModel)]="amount"
            placeholder="0.00"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Date</ion-label>
          <ion-datetime-button datetime="datetime"></ion-datetime-button>
          <ion-modal [keepContentsMounted]="true">
            <ng-template>
              <ion-datetime
                id="datetime"
                presentation="date"
                [(ngModel)]="date"
              ></ion-datetime>
            </ng-template>
          </ion-modal>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Account</ion-label>
          <ion-select [(ngModel)]="selectedAccountId" interface="popover">
            <ion-select-option
              *ngFor="let acc of accounts$ | async"
              [value]="acc.id"
            >
              {{ acc.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item *ngIf="type === 'transfer'">
          <ion-label position="stacked">To Account</ion-label>
          <ion-select [(ngModel)]="toAccountId" interface="popover">
            <ion-select-option
              *ngFor="let acc of accounts$ | async"
              [value]="acc.id"
            >
              {{ acc.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item *ngIf="type !== 'transfer'">
          <ion-label position="stacked">Category</ion-label>
          <ion-select [(ngModel)]="selectedCategoryId" interface="popover">
            <ion-select-option
              *ngFor="let cat of categories$ | async"
              [value]="cat.id"
            >
              {{ cat.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Note</ion-label>
          <ion-textarea
            [(ngModel)]="note"
            placeholder="Description"
          ></ion-textarea>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
})
export class AddTransactionModalComponent implements OnInit {
  type: TransactionType = 'expense';
  amount: number | null = null;
  date: string = new Date().toISOString();
  selectedAccountId: string = '';
  toAccountId: string = '';
  selectedCategoryId: string = '';
  note: string = '';

  accounts$: Observable<Account[]>;
  categories$: Observable<Category[]>;

  constructor(
    private modalCtrl: ModalController,
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private accountService: AccountService,
  ) {
    addIcons({ closeOutline, checkmarkOutline });
    this.accounts$ = this.accountService.accounts$;
    this.categories$ = this.categoryService.categories$;
  }

  ngOnInit() {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async save() {
    if (!this.amount || !this.selectedAccountId) return;

    // Simple validation for transfer
    if (this.type === 'transfer' && !this.toAccountId) return;
    if (this.type !== 'transfer' && !this.selectedCategoryId) return;

    await this.transactionService.addTransaction({
      amount: this.amount,
      date: this.date,
      accountId: this.selectedAccountId,
      toAccountId: this.toAccountId || undefined,
      categoryId: this.selectedCategoryId || 'transfer', // Handle transfer category later
      type: this.type,
      note: this.note,
    });

    this.dismiss();
  }
}
