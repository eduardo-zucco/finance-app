import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import {
  BudgetService,
  BudgetStatus,
} from '../../core/services/budget.service';
import { Observable } from 'rxjs';
import { AddBudgetModalComponent } from './components/add-budget-modal.component';
import { addIcons } from 'ionicons';
import {
  addOutline,
  warningOutline,
  alertCircleOutline,
  trashOutline,
  checkmarkCircleOutline,
  add,
  trendingUpOutline,
  walletOutline,
  analyticsOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent],
  template: `
    <app-page-header title="Orçamentos">
      <div slot="end">
        <ion-button
          fill="clear"
          class="header-icon-btn"
          (click)="openAddModal()"
        >
          <ion-icon name="add" slot="icon-only"></ion-icon>
        </ion-button>
      </div>
    </app-page-header>

    <ion-content [fullscreen]="true">
      <div class="budgets-root">
        <div class="budgets-main">
          <ng-container *ngIf="budgetStatus$ | async as statusList">
            <div *ngIf="statusList.length === 0" class="empty-state">
              <div class="empty-icon-box">
                <ion-icon name="analytics-outline"></ion-icon>
              </div>
              <h3>Nenhum orçamento</h3>
              <p>Defina limites por categoria para controlar seus gastos</p>
              <ion-button
                (click)="openAddModal()"
                color="primary"
                class="add-first-btn"
              >
                <ion-icon name="add" slot="start"></ion-icon>
                Criar primeiro
              </ion-button>
            </div>

            <ng-container *ngIf="statusList.length > 0">
              <div
                class="summary-banner"
                [ngClass]="getSummaryBannerClass(statusList)"
              >
                <div class="summary-banner-left">
                  <div class="summary-icon-circle">
                    <ion-icon [name]="getSummaryIcon(statusList)"></ion-icon>
                  </div>
                  <div>
                    <p class="summary-banner-title">
                      {{ getSummaryMessage(statusList) }}
                    </p>
                    <p class="summary-banner-sub">
                      {{ statusList.length }} categorias monitoradas
                    </p>
                  </div>
                </div>
                <div class="summary-banner-badge">
                  {{
                    getOverCount(statusList) > 0
                      ? getOverCount(statusList) + ' Excedido(s)'
                      : 'Tudo sob controle'
                  }}
                </div>
              </div>
            </ng-container>

            <div
              *ngFor="let item of statusList"
              class="budget-card"
              [ngClass]="'card--' + item.status"
            >
              <div class="budget-card-header">
                <div
                  class="budget-icon-wrap"
                  [ngClass]="'icon--' + item.status"
                >
                  <ion-icon [name]="getStatusIcon(item.status)"></ion-icon>
                </div>
                <div class="budget-title-col">
                  <h3 class="budget-name">{{ item.budget.categoryId }}</h3>
                  <span class="budget-period"
                    >Mês de {{ currentMonthName | titlecase }}</span
                  >
                </div>
                <div class="budget-actions">
                  <span
                    class="budget-pct-badge"
                    [ngClass]="'badge--' + item.status"
                  >
                    {{ item.percentage | number: '1.0-0' }}%
                  </span>
                  <button
                    class="budget-delete-btn"
                    (click)="confirmDelete(item.budget.id)"
                  >
                    <ion-icon name="trash-outline"></ion-icon>
                  </button>
                </div>
              </div>

              <div class="progress-track">
                <div
                  class="progress-fill"
                  [ngClass]="'fill--' + item.status"
                  [style.width]="getBarWidth(item) + '%'"
                ></div>
              </div>

              <div class="budget-values">
                <div class="budget-value-col">
                  <span class="bv-label">Gasto</span>
                  <span class="bv-amount" [ngClass]="'text--' + item.status">
                    {{ item.spent | currency: 'BRL' }}
                  </span>
                </div>
                <div class="budget-value-col center">
                  <span class="bv-label">Disponível</span>
                  <span
                    class="bv-amount"
                    [ngClass]="
                      item.remaining >= 0 ? 'remaining-ok' : 'remaining-over'
                    "
                  >
                    {{
                      item.remaining >= 0
                        ? (item.remaining | currency: 'BRL')
                        : (item.remaining | currency: 'BRL')
                    }}
                  </span>
                </div>
                <div class="budget-value-col right">
                  <span class="bv-label">Limite</span>
                  <span class="bv-amount limit">{{
                    item.budget.amount | currency: 'BRL'
                  }}</span>
                </div>
              </div>
            </div>
          </ng-container>
        </div>

        <aside class="budgets-sidebar">
          <ng-container *ngIf="budgetStatus$ | async as statusList">
            <div *ngIf="statusList.length > 0">
              <div class="sidebar-card">
                <p class="sidebar-card-title">Resumo Financeiro</p>
                <div class="totals-row">
                  <div class="total-item">
                    <span class="total-label">Total Gasto</span>
                    <span class="total-val">{{
                      getTotalSpent(statusList) | currency: 'BRL'
                    }}</span>
                  </div>
                  <div class="total-divider"></div>
                  <div class="total-item">
                    <span class="total-label">Limite Total</span>
                    <span class="total-val text-zinc-500">{{
                      getTotalLimit(statusList) | currency: 'BRL'
                    }}</span>
                  </div>
                </div>
                <div class="global-track">
                  <div
                    class="global-fill"
                    [style.width]="getGlobalPct(statusList) + '%'"
                    [ngClass]="
                      getGlobalPct(statusList) >= 100
                        ? 'exceeded'
                        : getGlobalPct(statusList) >= 80
                          ? 'warning'
                          : 'ok'
                    "
                  ></div>
                </div>
                <p class="global-pct-label">
                  {{ getGlobalPct(statusList) | number: '1.0-0' }}% do teto
                  mensal utilizado
                </p>
              </div>

              <div class="sidebar-card">
                <p class="sidebar-card-title">Status por Categoria</p>
                <div *ngFor="let item of statusList" class="sidebar-row">
                  <div class="sbr-left">
                    <div
                      class="sbr-dot"
                      [ngClass]="'dot--' + item.status"
                    ></div>
                    <span class="sbr-name">{{ item.budget.categoryId }}</span>
                  </div>
                  <div class="sbr-right">
                    <span class="sbr-pct" [ngClass]="'text--' + item.status"
                      >{{ item.percentage | number: '1.0-0' }}%</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <ion-button
              expand="block"
              (click)="openAddModal()"
              class="add-budget-btn"
            >
              <ion-icon name="add" slot="start"></ion-icon>
              Novo Orçamento
            </ion-button>
          </ng-container>
        </aside>
      </div>

      <ion-fab
        vertical="bottom"
        horizontal="end"
        slot="fixed"
        class="md:hidden"
      >
        <ion-fab-button
          (click)="openAddModal()"
          color="primary"
          class="shadow-glow"
        >
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [
    `
      ion-content {
        --background: #000000;
        --color: #ffffff;
      }

      /* ── Layout ── */
      .budgets-root {
        display: flex;
        gap: 24px;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px 16px 100px;
        align-items: flex-start;
      }
      .budgets-main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .budgets-sidebar {
        display: none;
        width: 300px;
        flex-shrink: 0;
        position: sticky;
        top: 20px;
        flex-direction: column;
        gap: 16px;
      }
      @media (min-width: 900px) {
        .budgets-sidebar {
          display: flex;
        }
      }

      /* ── Header ── */
      .header-icon-btn {
        color: #a1a1aa;
      }

      /* ── Empty State ── */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 80px 24px;
        text-align: center;
      }
      .empty-icon-box {
        width: 80px;
        height: 80px;
        background: #121212;
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        color: #4f46e5;
        margin-bottom: 20px;
        border: 1px solid #27272a;
      }
      .empty-state h3 {
        font-size: 20px;
        font-weight: 800;
        margin: 0;
        color: white;
      }
      .empty-state p {
        color: #71717a;
        margin: 8px 0 24px;
        font-size: 14px;
      }

      /* ── Banner ── */
      .summary-banner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-radius: 20px;
        border: 1px solid transparent;
      }
      .summary-banner.ok {
        background: rgba(16, 185, 129, 0.1);
        border-color: rgba(16, 185, 129, 0.2);
        color: #34d399;
      }
      .summary-banner.warn {
        background: rgba(245, 158, 11, 0.1);
        border-color: rgba(245, 158, 11, 0.2);
        color: #fbbf24;
      }
      .summary-banner.bad {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.2);
        color: #f87171;
      }

      .summary-banner-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .summary-icon-circle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }
      .summary-banner-title {
        font-size: 15px;
        font-weight: 800;
        margin: 0;
      }
      .summary-banner-sub {
        font-size: 12px;
        opacity: 0.7;
        margin: 2px 0 0;
      }
      .summary-banner-badge {
        font-size: 10px;
        font-weight: 900;
        text-transform: uppercase;
        padding: 4px 10px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.1);
      }

      /* ── Cards ── */
      .budget-card,
      .sidebar-card {
        background: #121212;
        border: 1px solid #27272a;
        border-radius: 24px;
        padding: 20px;
      }
      .card--exceeded {
        border-color: rgba(239, 68, 68, 0.4);
      }
      .card--warning {
        border-color: rgba(245, 158, 11, 0.4);
      }

      .budget-card-header {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .budget-icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }
      .icon--normal {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
      }
      .icon--warning {
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
      }
      .icon--exceeded {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
      }

      .budget-name {
        font-size: 17px;
        font-weight: 800;
        color: white;
        margin: 0;
      }
      .budget-period {
        font-size: 12px;
        color: #71717a;
      }

      .budget-pct-badge {
        font-size: 11px;
        font-weight: 900;
        padding: 4px 10px;
        border-radius: 20px;
      }
      .badge--normal {
        background: rgba(16, 185, 129, 0.1);
        color: #34d399;
      }
      .badge--warning {
        background: rgba(245, 158, 11, 0.1);
        color: #fbbf24;
      }
      .badge--exceeded {
        background: rgba(239, 68, 68, 0.1);
        color: #f87171;
      }

      .budget-delete-btn {
        background: transparent;
        border: none;
        color: #3f3f46;
        padding: 8px;
        cursor: pointer;
        font-size: 18px;
        transition: color 0.2s;
      }
      .budget-delete-btn:hover {
        color: #f87171;
      }

      /* ── Progress ── */
      .progress-track {
        height: 8px;
        background: #1c1c1f;
        border-radius: 10px;
        margin: 16px 0;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        border-radius: 10px;
        transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .fill--normal {
        background: #10b981;
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
      }
      .fill--warning {
        background: #f59e0b;
        box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
      }
      .fill--exceeded {
        background: #ef4444;
        box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
      }

      /* ── Values ── */
      .budget-values {
        display: flex;
        justify-content: space-between;
      }
      .bv-label {
        font-size: 10px;
        font-weight: 800;
        color: #52525b;
        text-transform: uppercase;
        margin-bottom: 4px;
        display: block;
      }
      .bv-amount {
        font-size: 15px;
        font-weight: 800;
        color: #ffffff;
      }
      .text--normal {
        color: #34d399;
      }
      .text--warning {
        color: #fbbf24;
      }
      .text--exceeded {
        color: #f87171;
      }
      .remaining-ok {
        color: #10b981;
      }
      .remaining-over {
        color: #ef4444;
      }

      /* ── Sidebar ── */
      .sidebar-card-title {
        font-size: 11px;
        font-weight: 900;
        color: #52525b;
        text-transform: uppercase;
        margin-bottom: 16px;
      }
      .totals-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }
      .total-val {
        font-size: 20px;
        font-weight: 900;
        color: white;
        display: block;
      }
      .total-divider {
        width: 1px;
        height: 30px;
        background: #27272a;
      }
      .global-track {
        height: 6px;
        background: #1c1c1f;
        border-radius: 10px;
        margin-bottom: 8px;
      }
      .global-fill.ok {
        background: #10b981;
      }
      .global-fill.warning {
        background: #f59e0b;
      }
      .global-fill.exceeded {
        background: #ef4444;
      }
      .global-pct-label {
        font-size: 11px;
        color: #71717a;
      }

      .sidebar-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #1c1c1f;
      }
      .sbr-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .dot--normal {
        background: #10b981;
      }
      .dot--warning {
        background: #f59e0b;
      }
      .dot--exceeded {
        background: #ef4444;
      }
      .sbr-name {
        font-size: 13px;
        color: #a1a1aa;
        margin-left: 8px;
      }
      .sbr-pct {
        font-size: 13px;
        font-weight: 800;
      }

      .add-budget-btn {
        --border-radius: 16px;
        font-weight: 800;
        margin-top: 10px;
        --background: #4f46e5;
      }
      .shadow-glow {
        box-shadow: 0 0 20px rgba(79, 70, 229, 0.4);
      }
    `,
  ],
})
export class BudgetsPage implements OnInit {
  budgetStatus$: Observable<BudgetStatus[]>;
  currentMonthName = '';

  constructor(
    private budgetService: BudgetService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
  ) {
    addIcons({
      addOutline,
      warningOutline,
      alertCircleOutline,
      trashOutline,
      checkmarkCircleOutline,
      add,
      trendingUpOutline,
      walletOutline,
      analyticsOutline,
      chevronForwardOutline,
    });

    const now = new Date();
    this.currentMonthName = now.toLocaleString('pt-BR', { month: 'long' });
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.budgetStatus$ = this.budgetService.getBudgetStatus(currentMonth);
  }

  ngOnInit() {}

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: AddBudgetModalComponent,
      // handle: true,
      cssClass: 'black-modal', // Certifique-se de estilizar o modal também
    });
    await modal.present();
  }

  async confirmDelete(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Excluir?',
      message: 'Deseja remover este orçamento?',
      cssClass: 'custom-alert',
      buttons: [
        { text: 'Não', role: 'cancel' },
        {
          text: 'Sim, excluir',
          role: 'destructive',
          handler: () => this.budgetService.deleteBudget(id),
        },
      ],
    });
    await alert.present();
  }

  getBarWidth(item: BudgetStatus): number {
    return Math.min(item.percentage, 100);
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      normal: 'checkmark-circle-outline',
      warning: 'warning-outline',
      exceeded: 'alert-circle-outline',
    };
    return map[status] ?? 'analytics-outline';
  }

  getSummaryBannerClass(list: BudgetStatus[]): string {
    if (list.some((i) => i.status === 'exceeded')) return 'bad';
    if (list.some((i) => i.status === 'warning')) return 'warn';
    return 'ok';
  }

  getSummaryIcon(list: BudgetStatus[]): string {
    if (list.some((i) => i.status === 'exceeded'))
      return 'alert-circle-outline';
    if (list.some((i) => i.status === 'warning')) return 'warning-outline';
    return 'checkmark-circle-outline';
  }

  getSummaryMessage(list: BudgetStatus[]): string {
    const over = list.filter((i) => i.status === 'exceeded').length;
    if (over > 0) return `${over} Limite(s) excedido(s)!`;
    if (list.some((i) => i.status === 'warning')) return `Atenção aos limites`;
    return 'Orçamentos em dia 🎉';
  }

  getOverCount(list: BudgetStatus[]): number {
    return list.filter((i) => i.status === 'exceeded').length;
  }

  getTotalSpent(list: BudgetStatus[]): number {
    return list.reduce((acc, i) => acc + i.spent, 0);
  }

  getTotalLimit(list: BudgetStatus[]): number {
    return list.reduce((acc, i) => acc + i.budget.amount, 0);
  }

  getGlobalPct(list: BudgetStatus[]): number {
    const limit = this.getTotalLimit(list);
    return limit === 0
      ? 0
      : Math.min((this.getTotalSpent(list) / limit) * 100, 100);
  }
}
