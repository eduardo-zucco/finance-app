import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../core/services/transaction.service';
import { AccountService } from '../../../core/services/account.service';
import { CategoryService } from '../../../core/services/category.service';
import { Observable } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  checkmarkOutline,
  calendarOutline,
  pricetagOutline,
  walletOutline,
  textOutline,
  arrowDownCircle,
  arrowUpCircle,
  swapHorizontal,
  checkmarkCircleOutline,
  timeOutline,
} from 'ionicons/icons';
import { TransactionType } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-add-transaction-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="dismiss()" color="medium">
            <ion-icon name="close-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title class="text-sm font-medium text-gray-500"
          >Nova Movimentação</ion-title
        >
      </ion-toolbar>
    </ion-header>

    <ion-content [scrollY]="true" class="ion-padding-bottom">
      <!-- Seletor de tipo -->
      <div class="flex justify-center pt-2 pb-4 px-4">
        <div
          class="bg-gray-100 dark:bg-gray-800 p-1 rounded-full flex w-full max-w-sm"
        >
          <button
            *ngFor="let t of types"
            (click)="setType(t)"
            class="flex-1 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5"
            [ngClass]="
              type === t
                ? activeTypeClass(t)
                : 'text-gray-400 dark:text-gray-500'
            "
          >
            <ion-icon [name]="getTypeIcon(t)" class="text-base"></ion-icon>
            <span>{{ getTypeName(t) }}</span>
          </button>
        </div>
      </div>

      <!-- Valor -->
      <div class="mb-6 text-center px-4">
        <p class="text-gray-400 text-xs mb-1 uppercase tracking-wider">Valor</p>
        <div class="flex items-center justify-center">
          <span
            class="text-3xl font-medium mr-1"
            [ngClass]="{
              'text-red-500': type === 'expense',
              'text-green-600': type === 'income',
              'text-blue-500': type === 'transfer',
            }"
            >R$</span
          >
          <input
            type="number"
            [(ngModel)]="amount"
            placeholder="0,00"
            inputmode="decimal"
            class="text-5xl font-black bg-transparent border-none outline-none text-center w-full max-w-[280px] placeholder-gray-200 dark:placeholder-gray-700"
            [class]="
              type === 'expense'
                ? 'text-red-500'
                : type === 'income'
                  ? 'text-green-600'
                  : 'text-blue-500'
            "
            autofocus
          />
        </div>
      </div>

      <!-- Campos do formulário -->
      <div class="space-y-3 px-4 pb-4">
        <!-- Status: Pago / Pendente -->
        <div
          class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3 flex items-center justify-between border border-gray-100 dark:border-gray-700 cursor-pointer"
          (click)="isPaid = !isPaid"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
              [ngClass]="
                isPaid
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/40'
                  : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40'
              "
            >
              <ion-icon
                [name]="isPaid ? 'checkmark-circle-outline' : 'time-outline'"
                class="text-xl"
              ></ion-icon>
            </div>
            <div>
              <p class="text-sm font-bold text-gray-800 dark:text-white">
                {{ isPaid ? 'Concluído' : 'Agendado / Pendente' }}
              </p>
              <p class="text-xs text-gray-400">
                {{ isPaid ? 'Afeta o saldo atual' : 'Não afeta o saldo ainda' }}
              </p>
            </div>
          </div>
          <!-- stopPropagation para o toggle não acionar 2x o click do container -->
          <ion-toggle
            [checked]="isPaid"
            (ionChange)="isPaid = $event.detail.checked"
            (click)="$event.stopPropagation()"
          >
          </ion-toggle>
        </div>

        <!-- Descrição -->
        <div
          class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl px-4 py-3 flex items-center gap-3 border border-gray-100 dark:border-gray-700"
        >
          <div
            class="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 flex-shrink-0"
          >
            <ion-icon name="text-outline" class="text-lg"></ion-icon>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-400 mb-0.5">Descrição</p>
            <input
              type="text"
              [(ngModel)]="description"
              placeholder="Ex: Supermercado..."
              class="w-full bg-transparent outline-none font-semibold text-gray-800 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 text-sm"
            />
          </div>
        </div>

        <!-- Data — input nativo em vez de ion-datetime aninhado -->
        <div
          class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl px-4 py-3 flex items-center gap-3 border border-gray-100 dark:border-gray-700"
        >
          <div
            class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 flex-shrink-0"
          >
            <ion-icon name="calendar-outline" class="text-lg"></ion-icon>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-400 mb-0.5">Data</p>
            <input
              type="date"
              [(ngModel)]="dateInput"
              class="w-full bg-transparent outline-none font-semibold text-gray-800 dark:text-white text-sm cursor-pointer"
            />
          </div>
        </div>

        <!-- Conta de origem -->
        <div
          class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl px-4 py-3 flex items-center gap-3 border border-gray-100 dark:border-gray-700"
        >
          <div
            class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 flex-shrink-0"
          >
            <ion-icon name="wallet-outline" class="text-lg"></ion-icon>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-400 mb-0.5">
              {{ type === 'transfer' ? 'Conta de origem' : 'Conta' }}
            </p>
            <ion-select
              [(ngModel)]="selectedAccountId"
              interface="action-sheet"
              placeholder="Selecione a conta"
              class="font-semibold text-gray-800 dark:text-gray-200 text-sm -ml-2 max-w-full"
            >
              <ion-select-option
                *ngFor="let acc of accounts$ | async"
                [value]="acc.id"
              >
                {{ acc.name }}
              </ion-select-option>
            </ion-select>
          </div>
        </div>

        <!-- Conta de destino (apenas transferência) -->
        <div
          *ngIf="type === 'transfer'"
          class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl px-4 py-3 flex items-center gap-3 border border-gray-100 dark:border-gray-700"
        >
          <div
            class="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500 flex-shrink-0"
          >
            <ion-icon name="arrow-down-circle" class="text-lg"></ion-icon>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-400 mb-0.5">Conta de destino</p>
            <ion-select
              [(ngModel)]="destinationAccountId"
              interface="action-sheet"
              placeholder="Selecione a conta"
              class="font-semibold text-gray-800 dark:text-gray-200 text-sm -ml-2 max-w-full"
            >
              <ion-select-option
                *ngFor="let acc of accounts$ | async"
                [value]="acc.id"
              >
                {{ acc.name }}
              </ion-select-option>
            </ion-select>
          </div>
        </div>

        <!-- Categoria (exceto transferência) -->
        <div
          *ngIf="type !== 'transfer'"
          class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl px-4 py-3 flex items-center gap-3 border border-gray-100 dark:border-gray-700"
        >
          <div
            class="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-500 flex-shrink-0"
          >
            <ion-icon name="pricetag-outline" class="text-lg"></ion-icon>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-400 mb-0.5">Categoria</p>
            <ion-select
              [(ngModel)]="selectedCategoryId"
              interface="action-sheet"
              placeholder="Selecione a categoria"
              class="font-semibold text-gray-800 dark:text-gray-200 text-sm -ml-2 max-w-full"
            >
              <ion-select-option
                *ngFor="let cat of categories$ | async"
                [value]="cat.id"
              >
                {{ cat.name }}
              </ion-select-option>
            </ion-select>
          </div>
        </div>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border">
      <div
        class="px-4 pt-3 pb-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
      >
        <ion-button
          expand="block"
          (click)="save()"
          [disabled]="!isFormValid()"
          class="h-14 font-bold text-base"
          [color]="
            type === 'expense'
              ? 'danger'
              : type === 'income'
                ? 'success'
                : 'primary'
          "
        >
          <ion-icon name="checkmark-outline" slot="start"></ion-icon>
          Salvar
          {{
            type === 'expense'
              ? 'Despesa'
              : type === 'income'
                ? 'Receita'
                : 'Transferência'
          }}
        </ion-button>
      </div>
    </ion-footer>
  `,
  styles: [
    `
      input[type='number']::-webkit-inner-spin-button,
      input[type='number']::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type='date']::-webkit-calendar-picker-indicator {
        opacity: 0.5;
        cursor: pointer;
      }
      ion-select::part(text) {
        font-weight: 600;
      }
      ion-select::part(placeholder) {
        color: #9ca3af;
      }
    `,
  ],
})
export class AddTransactionModalComponent implements OnInit {
  types: TransactionType[] = ['expense', 'income', 'transfer'];
  type: TransactionType = 'expense';

  amount: number | null = null;
  // Separamos dateInput (string YYYY-MM-DD para o input nativo) do date ISO
  dateInput: string = new Date().toISOString().split('T')[0];
  description: string = '';
  isPaid: boolean = true;

  selectedAccountId: string = '';
  destinationAccountId: string = '';
  selectedCategoryId: string = '';

  accounts$: Observable<any[]>;
  categories$: Observable<any[]>;

  constructor(
    private modalCtrl: ModalController,
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private accountService: AccountService,
  ) {
    addIcons({
      closeOutline,
      checkmarkOutline,
      calendarOutline,
      pricetagOutline,
      walletOutline,
      textOutline,
      arrowDownCircle,
      arrowUpCircle,
      swapHorizontal,
      checkmarkCircleOutline,
      timeOutline,
    });
    this.accounts$ = this.accountService.accounts$;
    this.categories$ = this.categoryService.categories$;
  }

  ngOnInit() {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  setType(t: TransactionType) {
    this.type = t;
  }

  isFormValid(): boolean {
    if (!this.amount || this.amount <= 0) return false;
    if (!this.selectedAccountId) return false;
    if (!this.description.trim()) return false;
    if (this.type === 'transfer' && !this.destinationAccountId) return false;
    return true;
  }

  activeTypeClass(t: string): string {
    const classes: Record<string, string> = {
      expense: 'bg-red-100 text-red-600 dark:bg-red-900/40',
      income: 'bg-green-100 text-green-600 dark:bg-green-900/40',
      transfer: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40',
    };
    return classes[t] ?? '';
  }

  getTypeName(t: string): string {
    const map: Record<string, string> = {
      expense: 'Despesa',
      income: 'Receita',
      transfer: 'Transf.',
    };
    return map[t] ?? t;
  }

  getTypeIcon(t: string): string {
    const map: Record<string, string> = {
      expense: 'arrow-down-circle',
      income: 'arrow-up-circle',
      transfer: 'swap-horizontal',
    };
    return map[t] ?? 'ellipse';
  }

  async save() {
    if (!this.isFormValid()) return;

    const isoDate = new Date(this.dateInput + 'T12:00:00').toISOString();
    const finalCategory =
      this.type === 'transfer'
        ? 'transfer-system'
        : this.selectedCategoryId || 'general';

    await this.transactionService.addTransaction({
      amount: this.amount!,
      date: isoDate,
      accountId: this.selectedAccountId,
      destinationAccountId: this.destinationAccountId || undefined,
      categoryId: finalCategory,
      type: this.type,
      description: this.description.trim(),
      isPaid: this.isPaid,
    });

    this.dismiss();
  }
}
