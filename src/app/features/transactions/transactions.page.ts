import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import {
  TransactionService,
  DayGroup,
} from '../../core/services/transaction.service';
import { Observable } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  addOutline,
  searchOutline,
  filterOutline,
  timeOutline,
  trashOutline,
  add,
  trendingUpOutline,
  trendingDownOutline,
  swapHorizontalOutline,
  calendarOutline,
  ellipsisVerticalOutline,
} from 'ionicons/icons';
import { AddTransactionModalComponent } from './components/add-transaction-modal.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent],
  template: `
    <app-page-header title="Extrato">
      <div slot="end" class="flex items-center gap-1">
        <ion-button fill="clear" color="medium">
          <ion-icon name="search-outline" slot="icon-only"></ion-icon>
        </ion-button>
        <ion-button fill="clear" color="medium">
          <ion-icon name="filter-outline" slot="icon-only"></ion-icon>
        </ion-button>
        <ion-button
          (click)="openAddModal()"
          color="primary"
          class="hidden md:block"
          fill="solid"
          shape="round"
          size="small"
        >
          <ion-icon name="add" slot="start"></ion-icon>
          Nova
        </ion-button>
      </div>
    </app-page-header>

    <ion-content [fullscreen]="true">
      <div class="transactions-layout">
        <!-- ── COLUNA PRINCIPAL: lista ── -->
        <div class="transactions-main">
          <ng-container *ngIf="groupedTransactions$ | async as groups">
            <!-- Estado vazio -->
            <div *ngIf="groups.length === 0" class="empty-state">
              <div class="empty-icon">📭</div>
              <h3>Nenhuma transação ainda</h3>
              <p>Registre sua primeira movimentação financeira</p>
              <ion-button
                (click)="openAddModal()"
                color="primary"
                shape="round"
              >
                <ion-icon name="add" slot="start"></ion-icon>
                Adicionar transação
              </ion-button>
            </div>

            <!-- Grupos por dia -->
            <div *ngFor="let group of groups" class="day-group">
              <!-- Header do dia (sticky) -->
              <div class="day-header">
                <div class="day-header-left">
                  <ion-icon name="calendar-outline" class="day-icon"></ion-icon>
                  <span class="day-date">
                    {{ group.date | date: 'dd MMM' : '' : 'pt-BR' }}
                  </span>
                  <span class="day-weekday">
                    {{ group.date | date: 'EEEE' : '' : 'pt-BR' }}
                  </span>
                </div>
                <div
                  class="day-total"
                  [class.positive]="group.total >= 0"
                  [class.negative]="group.total < 0"
                >
                  <span *ngIf="group.total >= 0">+</span
                  >{{ group.total | currency: 'BRL' }}
                </div>
              </div>

              <!-- Cartão com transações do dia -->
              <div class="day-card">
                <div
                  *ngFor="let t of group.transactions; let last = last"
                  class="transaction-row"
                  [class.last]="last"
                  (click)="onTransactionClick(t)"
                >
                  <!-- Ícone do tipo -->
                  <div class="tx-icon" [ngClass]="'tx-icon--' + t.type">
                    <ion-icon [name]="getIconName(t.type)"></ion-icon>
                  </div>

                  <!-- Info principal -->
                  <div class="tx-info">
                    <div class="tx-top">
                      <span class="tx-description" [class.pending]="!t.isPaid">
                        {{ t.description }}
                      </span>
                      <span
                        class="tx-amount"
                        [ngClass]="'tx-amount--' + t.type"
                        [class.pending]="!t.isPaid"
                      >
                        {{ t.type === 'expense' ? '-' : '+'
                        }}{{ t.amount | currency: 'BRL' }}
                      </span>
                    </div>
                    <div class="tx-bottom">
                      <span class="tx-meta">
                        {{ t.categoryId || 'Geral' }}
                        <span class="tx-dot">·</span>
                        {{ t.accountId || 'Conta' }}
                      </span>
                      <span class="tx-status" [class.scheduled]="!t.isPaid">
                        <ion-icon
                          *ngIf="!t.isPaid"
                          name="time-outline"
                          class="tx-status-icon"
                        ></ion-icon>
                        {{ !t.isPaid ? 'Agendado' : (t.date | date: 'HH:mm') }}
                      </span>
                    </div>
                  </div>

                  <!-- Ação: deletar -->
                  <button
                    class="tx-delete"
                    (click)="confirmDelete(t.id, $event)"
                    title="Apagar transação"
                  >
                    <ion-icon name="trash-outline"></ion-icon>
                  </button>
                </div>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- ── SIDEBAR DESKTOP: resumo ── -->
        <aside class="transactions-sidebar">
          <ng-container *ngIf="groupedTransactions$ | async as groups">
            <div class="sidebar-card">
              <h3 class="sidebar-title">Resumo do período</h3>
              <div class="summary-row income">
                <div class="summary-label">
                  <div class="summary-dot income"></div>
                  Receitas
                </div>
                <span class="summary-value income">{{
                  getTotalIncome(groups) | currency: 'BRL'
                }}</span>
              </div>
              <div class="summary-row expense">
                <div class="summary-label">
                  <div class="summary-dot expense"></div>
                  Despesas
                </div>
                <span class="summary-value expense">{{
                  getTotalExpense(groups) | currency: 'BRL'
                }}</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row balance">
                <div class="summary-label bold">Saldo líquido</div>
                <span
                  class="summary-value bold"
                  [class.positive]="getBalance(groups) >= 0"
                  [class.negative]="getBalance(groups) < 0"
                >
                  {{ getBalance(groups) | currency: 'BRL' }}
                </span>
              </div>
            </div>

            <div class="sidebar-card">
              <h3 class="sidebar-title">Transações</h3>
              <div class="stat-grid">
                <div class="stat-item">
                  <span class="stat-value">{{ getTotalCount(groups) }}</span>
                  <span class="stat-label">Total</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value pending">{{
                    getPendingCount(groups)
                  }}</span>
                  <span class="stat-label">Pendentes</span>
                </div>
              </div>
            </div>

            <!-- Botão nova transação na sidebar -->
            <ion-button
              expand="block"
              (click)="openAddModal()"
              color="primary"
              shape="round"
              class="sidebar-add-btn"
            >
              <ion-icon name="add" slot="start"></ion-icon>
              Nova transação
            </ion-button>
          </ng-container>
        </aside>
      </div>

      <!-- FAB mobile -->
      <ion-fab
        vertical="bottom"
        horizontal="end"
        slot="fixed"
        class="mobile-fab"
      >
        <ion-fab-button (click)="openAddModal()" color="primary">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [
    `
      /* ── Layout geral ── */
      .transactions-layout {
        display: flex;
        gap: 24px;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px 16px 100px;
        align-items: flex-start;
      }

      .transactions-main {
        flex: 1;
        min-width: 0;
      }

      /* ── Sidebar (só desktop) ── */
      .transactions-sidebar {
        display: none;
        width: 280px;
        flex-shrink: 0;
        position: sticky;
        top: 20px;
      }

      @media (min-width: 900px) {
        .transactions-sidebar {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .mobile-fab {
          display: none !important;
        }
      }

      /* ── Cards da sidebar ── */
      .sidebar-card {
        background: var(--ion-color-light, #fff);
        border: 1px solid var(--ion-border-color, #e5e7eb);
        border-radius: 16px;
        padding: 20px;
      }

      :host-context(.dark) .sidebar-card {
        background: #1f2937;
        border-color: #374151;
      }

      .sidebar-title {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--ion-color-medium, #9ca3af);
        margin: 0 0 16px;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
      }

      .summary-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: var(--ion-color-medium-shade, #6b7280);
      }

      .summary-label.bold {
        font-weight: 700;
        color: var(--ion-text-color, #111827);
      }

      .summary-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      .summary-dot.income {
        background: #10b981;
      }
      .summary-dot.expense {
        background: #ef4444;
      }

      .summary-value {
        font-size: 15px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }

      .summary-value.income {
        color: #10b981;
      }
      .summary-value.expense {
        color: #ef4444;
      }
      .summary-value.bold {
        font-size: 17px;
        font-weight: 800;
      }
      .summary-value.positive {
        color: #10b981;
      }
      .summary-value.negative {
        color: #ef4444;
      }

      .summary-divider {
        height: 1px;
        background: var(--ion-border-color, #e5e7eb);
        margin: 8px 0;
      }

      .stat-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px;
        background: var(--ion-color-light-shade, #f3f4f6);
        border-radius: 12px;
        gap: 4px;
      }

      :host-context(.dark) .stat-item {
        background: #111827;
      }

      .stat-value {
        font-size: 22px;
        font-weight: 800;
        color: var(--ion-text-color, #111827);
      }

      .stat-value.pending {
        color: #f59e0b;
      }

      .stat-label {
        font-size: 11px;
        color: var(--ion-color-medium, #9ca3af);
        font-weight: 500;
      }

      .sidebar-add-btn {
        margin-top: 4px;
      }

      /* ── Estado vazio ── */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 64px 24px;
        text-align: center;
        gap: 8px;
      }

      .empty-icon {
        font-size: 48px;
        margin-bottom: 8px;
      }

      .empty-state h3 {
        font-size: 18px;
        font-weight: 700;
        color: var(--ion-text-color);
        margin: 0;
      }

      .empty-state p {
        font-size: 14px;
        color: var(--ion-color-medium);
        margin: 0 0 16px;
      }

      /* ── Grupos de dia ── */
      .day-group {
        margin-bottom: 24px;
      }

      .day-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 4px 8px;
        position: sticky;
        top: 0;
        z-index: 10;
        background: var(--ion-background-color, #f9fafb);
      }

      :host-context(.dark) .day-header {
        background: #111827;
      }

      .day-header-left {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .day-icon {
        font-size: 14px;
        color: var(--ion-color-medium);
      }

      .day-date {
        font-size: 13px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--ion-text-color);
      }

      .day-weekday {
        font-size: 12px;
        color: var(--ion-color-medium);
        text-transform: capitalize;
      }

      .day-total {
        font-size: 13px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        padding: 3px 10px;
        border-radius: 20px;
      }

      .day-total.positive {
        color: #10b981;
        background: #d1fae5;
      }

      .day-total.negative {
        color: #6b7280;
        background: #f3f4f6;
      }

      :host-context(.dark) .day-total.negative {
        background: #374151;
      }

      /* ── Cartão de transações ── */
      .day-card {
        background: var(--ion-color-light, #fff);
        border: 1px solid var(--ion-border-color, #e5e7eb);
        border-radius: 16px;
        overflow: hidden;
      }

      :host-context(.dark) .day-card {
        background: #1f2937;
        border-color: #374151;
      }

      /* ── Linha de transação ── */
      .transaction-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border-bottom: 1px solid var(--ion-border-color, #f3f4f6);
        cursor: pointer;
        transition: background 0.15s ease;
        position: relative;
      }

      .transaction-row:last-child,
      .transaction-row.last {
        border-bottom: none;
      }

      .transaction-row:hover {
        background: var(--ion-color-light-shade, #f9fafb);
      }

      :host-context(.dark) .transaction-row:hover {
        background: #374151;
      }

      /* Mostrar botão deletar no hover */
      .tx-delete {
        opacity: 0;
        transition: opacity 0.15s ease;
      }

      .transaction-row:hover .tx-delete {
        opacity: 1;
      }

      /* Mobile: sempre visível */
      @media (max-width: 768px) {
        .tx-delete {
          opacity: 0.3;
        }
      }

      /* ── Ícone do tipo ── */
      .tx-icon {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
      }

      .tx-icon--expense {
        background: #fee2e2;
        color: #ef4444;
      }

      .tx-icon--income {
        background: #d1fae5;
        color: #10b981;
      }

      .tx-icon--transfer {
        background: #dbeafe;
        color: #3b82f6;
      }

      :host-context(.dark) .tx-icon--expense {
        background: rgba(239, 68, 68, 0.15);
      }
      :host-context(.dark) .tx-icon--income {
        background: rgba(16, 185, 129, 0.15);
      }
      :host-context(.dark) .tx-icon--transfer {
        background: rgba(59, 130, 246, 0.15);
      }

      /* ── Info da transação ── */
      .tx-info {
        flex: 1;
        min-width: 0;
      }

      .tx-top {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 8px;
        margin-bottom: 4px;
      }

      .tx-description {
        font-size: 15px;
        font-weight: 600;
        color: var(--ion-text-color, #111827);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .tx-description.pending {
        opacity: 0.5;
      }

      .tx-amount {
        font-size: 15px;
        font-weight: 700;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }

      .tx-amount.pending {
        opacity: 0.5;
      }
      .tx-amount--expense {
        color: #ef4444;
      }
      .tx-amount--income {
        color: #10b981;
      }
      .tx-amount--transfer {
        color: #6b7280;
      }

      .tx-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .tx-meta {
        font-size: 12px;
        color: var(--ion-color-medium, #9ca3af);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-right: 8px;
      }

      .tx-dot {
        margin: 0 4px;
        opacity: 0.5;
      }

      .tx-status {
        font-size: 11px;
        color: var(--ion-color-medium);
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 3px;
      }

      .tx-status.scheduled {
        color: #d97706;
        background: #fef3c7;
        padding: 2px 8px;
        border-radius: 20px;
        font-weight: 700;
      }

      :host-context(.dark) .tx-status.scheduled {
        background: rgba(217, 119, 6, 0.2);
      }

      .tx-status-icon {
        font-size: 11px;
      }

      /* ── Botão deletar ── */
      .tx-delete {
        background: none;
        border: none;
        padding: 8px;
        border-radius: 8px;
        color: var(--ion-color-medium);
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.15s ease;
      }

      .tx-delete:hover {
        background: #fee2e2;
        color: #ef4444;
      }

      :host-context(.dark) .tx-delete:hover {
        background: rgba(239, 68, 68, 0.15);
      }

      /* ── FAB mobile ── */
      .mobile-fab {
        --ion-safe-area-bottom: env(safe-area-inset-bottom);
      }

      @media (min-width: 900px) {
        .mobile-fab {
          display: none !important;
        }
      }
    `,
  ],
})
export class TransactionsPage implements OnInit {
  groupedTransactions$: Observable<DayGroup[]>;

  constructor(
    private transactionService: TransactionService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
  ) {
    addIcons({
      addOutline,
      searchOutline,
      filterOutline,
      timeOutline,
      trashOutline,
      add,
      trendingUpOutline,
      trendingDownOutline,
      swapHorizontalOutline,
      calendarOutline,
      ellipsisVerticalOutline,
    });

    this.groupedTransactions$ =
      this.transactionService.getTransactionsGroupedByDate();
  }

  ngOnInit() {}

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: AddTransactionModalComponent,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      handle: true,
      cssClass: 'transaction-modal',
    });
    await modal.present();
  }

  async confirmDelete(id: string, event: Event) {
    event.stopPropagation();

    const alert = await this.alertCtrl.create({
      header: 'Apagar transação?',
      message: 'Essa ação não pode ser desfeita e o saldo será revertido.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Apagar',
          role: 'destructive',
          handler: () => this.deleteTransaction(id),
        },
      ],
    });
    await alert.present();
  }

  async deleteTransaction(id: string) {
    await this.transactionService.deleteTransaction(id);
  }

  onTransactionClick(t: any) {
    // placeholder para abrir detalhe/edição no futuro
  }

  getIconName(type: string): string {
    const map: Record<string, string> = {
      income: 'trending-up-outline',
      expense: 'trending-down-outline',
      transfer: 'swap-horizontal-outline',
    };
    return map[type] ?? 'ellipse';
  }

  // ── Cálculos para sidebar ──

  getTotalIncome(groups: DayGroup[]): number {
    return groups.reduce(
      (acc, g) =>
        acc +
        g.transactions
          .filter((t) => t.type === 'income' && t.isPaid)
          .reduce((s, t) => s + t.amount, 0),
      0,
    );
  }

  getTotalExpense(groups: DayGroup[]): number {
    return groups.reduce(
      (acc, g) =>
        acc +
        g.transactions
          .filter((t) => t.type === 'expense' && t.isPaid)
          .reduce((s, t) => s + t.amount, 0),
      0,
    );
  }

  getBalance(groups: DayGroup[]): number {
    return this.getTotalIncome(groups) - this.getTotalExpense(groups);
  }

  getTotalCount(groups: DayGroup[]): number {
    return groups.reduce((acc, g) => acc + g.transactions.length, 0);
  }

  getPendingCount(groups: DayGroup[]): number {
    return groups.reduce(
      (acc, g) => acc + g.transactions.filter((t) => !t.isPaid).length,
      0,
    );
  }
}
