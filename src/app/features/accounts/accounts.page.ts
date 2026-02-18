import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { AccountService } from '../../core/services/account.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Account } from '../../core/models/account.model';
import { AddAccountModalComponent } from './components/add-account-modal.component';
import { addIcons } from 'ionicons';
import {
  addOutline,
  walletOutline,
  cardOutline,
  cashOutline,
  trendingUpOutline,
  trashOutline,
  add,
  businessOutline,
  chevronForwardOutline,
  statsChartOutline,
} from 'ionicons/icons';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent],
  template: `
    <app-page-header title="Contas">
      <div slot="end">
        <ion-button fill="clear" color="medium" (click)="openAddModal()">
          <ion-icon name="add" slot="icon-only"></ion-icon>
        </ion-button>
      </div>
    </app-page-header>

    <ion-content [fullscreen]="true">
      <div class="accounts-root">
        <!-- ── Coluna principal ── -->
        <div class="accounts-main">
          <ng-container *ngIf="accounts$ | async as accounts">
            <!-- Estado vazio -->
            <div *ngIf="accounts.length === 0" class="empty-state">
              <div class="empty-icon">🏦</div>
              <h3>Nenhuma conta ainda</h3>
              <p>Adicione suas contas bancárias, carteiras e investimentos</p>
              <ion-button
                (click)="openAddModal()"
                color="primary"
                shape="round"
              >
                <ion-icon name="add" slot="start"></ion-icon>
                Adicionar conta
              </ion-button>
            </div>

            <!-- Patrimônio total (banner) -->
            <div *ngIf="accounts.length > 0" class="total-banner">
              <div class="total-banner-left">
                <p class="total-label">Patrimônio total</p>
                <h2 class="total-amount">
                  {{ getTotal(accounts) | currency: 'BRL' }}
                </h2>
              </div>
              <div class="total-count">
                {{ accounts.length }} conta{{ accounts.length > 1 ? 's' : '' }}
              </div>
            </div>

            <!-- Lista de contas -->
            <div class="accounts-list">
              <div
                *ngFor="let acc of accounts"
                class="account-card"
                [style.--accent]="acc.color"
              >
                <div class="account-card-left">
                  <!-- Indicador de cor lateral -->
                  <div class="color-bar" [style.background]="acc.color"></div>

                  <!-- Ícone -->
                  <div
                    class="acc-icon-wrap"
                    [style.background]="acc.color + '22'"
                  >
                    <ion-icon
                      [name]="acc.icon"
                      [style.color]="acc.color"
                    ></ion-icon>
                  </div>

                  <!-- Info -->
                  <div class="acc-info">
                    <h3 class="acc-name">{{ acc.name }}</h3>
                    <span class="acc-type-badge">{{
                      getTypeLabel(acc.type)
                    }}</span>
                  </div>
                </div>

                <div class="account-card-right">
                  <span
                    class="acc-balance"
                    [style.color]="acc.balance >= 0 ? acc.color : '#ef4444'"
                  >
                    {{ acc.balance | currency: 'BRL' }}
                  </span>
                  <button class="acc-delete-btn" (click)="confirmDelete(acc)">
                    <ion-icon name="trash-outline"></ion-icon>
                  </button>
                </div>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- ── Sidebar desktop ── -->
        <aside class="accounts-sidebar">
          <ng-container *ngIf="accounts$ | async as accounts">
            <div *ngIf="accounts.length > 0">
              <!-- Distribuição por tipo -->
              <div class="sidebar-card">
                <p class="sidebar-title">Por tipo</p>
                <div *ngFor="let group of getByType(accounts)" class="type-row">
                  <div class="type-row-left">
                    <div
                      class="type-dot"
                      [style.background]="group.color"
                    ></div>
                    <span class="type-name">{{ group.label }}</span>
                    <span class="type-count">{{ group.count }}</span>
                  </div>
                  <span class="type-balance" [style.color]="group.color">
                    {{ group.total | currency: 'BRL' }}
                  </span>
                </div>
              </div>

              <!-- Stats -->
              <div class="sidebar-card">
                <p class="sidebar-title">Resumo</p>
                <div class="stats-grid">
                  <div class="stat-box">
                    <span class="stat-val">{{ accounts.length }}</span>
                    <span class="stat-lbl">Contas</span>
                  </div>
                  <div class="stat-box">
                    <span class="stat-val positive">{{
                      getPositiveCount(accounts)
                    }}</span>
                    <span class="stat-lbl">Positivas</span>
                  </div>
                </div>
              </div>
            </div>

            <ion-button
              expand="block"
              (click)="openAddModal()"
              color="primary"
              shape="round"
            >
              <ion-icon name="add" slot="start"></ion-icon>
              Nova conta
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
      ion-content {
        --background: #111827;
      }

      /* ── Layout ── */
      .accounts-root {
        display: flex;
        gap: 24px;
        max-width: 1100px;
        margin: 0 auto;
        padding: 20px 16px 100px;
        align-items: flex-start;
      }

      .accounts-main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .accounts-sidebar {
        display: none;
        width: 260px;
        flex-shrink: 0;
        position: sticky;
        top: 20px;
        flex-direction: column;
        gap: 16px;
      }

      @media (min-width: 900px) {
        .accounts-sidebar {
          display: flex;
        }
        .mobile-fab {
          display: none !important;
        }
      }

      /* ── Empty ── */
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
        color: #f9fafb;
        margin: 0;
      }
      .empty-state p {
        font-size: 14px;
        color: #6b7280;
        margin: 0 0 16px;
      }

      /* ── Total banner ── */
      .total-banner {
        background: linear-gradient(
          135deg,
          #1e1b4b 0%,
          #312e81 60%,
          #4338ca 100%
        );
        border-radius: 20px;
        padding: 20px 22px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .total-label {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(255, 255, 255, 0.55);
        margin: 0 0 6px;
      }

      .total-amount {
        font-size: 28px;
        font-weight: 900;
        color: white;
        margin: 0;
        letter-spacing: -0.5px;
      }

      .total-count {
        font-size: 12px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.5);
        background: rgba(255, 255, 255, 0.12);
        padding: 6px 14px;
        border-radius: 20px;
        white-space: nowrap;
      }

      /* ── Account cards ── */
      .accounts-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .account-card {
        background: #1f2937;
        border: 1px solid #2d3748;
        border-radius: 18px;
        padding: 16px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        position: relative;
        overflow: hidden;
        transition: background 0.15s;
      }

      .account-card:hover {
        background: #252d3d;
      }

      /* Linha de cor lateral */
      .color-bar {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        border-radius: 4px 0 0 4px;
      }

      .account-card-left {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
        padding-left: 8px; /* compensate color-bar */
      }

      .acc-icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
      }

      .acc-info {
        min-width: 0;
      }

      .acc-name {
        font-size: 15px;
        font-weight: 700;
        color: #f9fafb;
        margin: 0 0 5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .acc-type-badge {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: #6b7280;
        background: #374151;
        padding: 2px 8px;
        border-radius: 6px;
      }

      .account-card-right {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
      }

      .acc-balance {
        font-size: 17px;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
      }

      .acc-delete-btn {
        background: none;
        border: none;
        padding: 7px;
        border-radius: 9px;
        color: #4b5563;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: all 0.15s;
      }

      .account-card:hover .acc-delete-btn {
        opacity: 1;
      }
      .acc-delete-btn:hover {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
      }

      @media (max-width: 768px) {
        .acc-delete-btn {
          opacity: 0.4;
        }
      }

      /* ── Sidebar ── */
      .sidebar-card {
        background: #1f2937;
        border: 1px solid #2d3748;
        border-radius: 18px;
        padding: 18px;
        margin-bottom: 16px;
      }

      .sidebar-title {
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #4b5563;
        margin: 0 0 14px;
      }

      .type-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #2d3748;
      }
      .type-row:last-child {
        border-bottom: none;
      }

      .type-row-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .type-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .type-name {
        font-size: 13px;
        font-weight: 600;
        color: #d1d5db;
      }

      .type-count {
        font-size: 11px;
        color: #4b5563;
        background: #374151;
        padding: 1px 7px;
        border-radius: 10px;
        font-weight: 600;
      }

      .type-balance {
        font-size: 13px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .stat-box {
        background: #111827;
        border-radius: 12px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .stat-val {
        font-size: 24px;
        font-weight: 900;
        color: #f9fafb;
      }

      .stat-val.positive {
        color: #34d399;
      }

      .stat-lbl {
        font-size: 11px;
        color: #4b5563;
        font-weight: 600;
      }
    `,
  ],
})
export class AccountsPage implements OnInit {
  accounts$: Observable<Account[]>;

  private readonly TYPE_META: Record<string, { label: string; color: string }> =
    {
      cash: { label: 'Dinheiro', color: '#10b981' },
      bank: { label: 'Banco', color: '#3b82f6' },
      card: { label: 'Cartão', color: '#8b5cf6' },
      savings: { label: 'Poupança', color: '#f59e0b' },
      investment: { label: 'Investimento', color: '#ef4444' },
    };

  constructor(
    private accountService: AccountService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
  ) {
    addIcons({
      addOutline,
      walletOutline,
      cardOutline,
      cashOutline,
      trendingUpOutline,
      trashOutline,
      add,
      businessOutline,
      chevronForwardOutline,
      statsChartOutline,
    });
    this.accounts$ = this.accountService.accounts$;
  }

  ngOnInit() {}

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: AddAccountModalComponent,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      handle: true,
      cssClass: 'transaction-modal',
    });
    await modal.present();
  }

  async confirmDelete(acc: Account) {
    const alert = await this.alertCtrl.create({
      header: `Excluir "${acc.name}"?`,
      message: 'As transações associadas não serão deletadas.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => this.accountService.deleteAccount(acc.id),
        },
      ],
    });
    await alert.present();
  }

  getTypeLabel(type: string): string {
    return this.TYPE_META[type]?.label ?? type;
  }

  getTotal(accounts: Account[]): number {
    return accounts.reduce((acc, a) => acc + a.balance, 0);
  }

  getPositiveCount(accounts: Account[]): number {
    return accounts.filter((a) => a.balance >= 0).length;
  }

  getByType(
    accounts: Account[],
  ): { label: string; color: string; count: number; total: number }[] {
    const map: Record<
      string,
      { label: string; color: string; count: number; total: number }
    > = {};

    accounts.forEach((acc) => {
      const meta = this.TYPE_META[acc.type] ?? {
        label: acc.type,
        color: '#6b7280',
      };
      if (!map[acc.type]) {
        map[acc.type] = {
          label: meta.label,
          color: meta.color,
          count: 0,
          total: 0,
        };
      }
      map[acc.type].count++;
      map[acc.type].total += acc.balance;
    });

    return Object.values(map);
  }
}
