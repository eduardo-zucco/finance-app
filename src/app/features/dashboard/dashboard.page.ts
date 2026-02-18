import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import {
  eyeOutline,
  eyeOffOutline,
  trendingUpOutline,
  trendingDownOutline,
  notificationsOutline,
  walletOutline,
  arrowUp,
  arrowDown,
  swapHorizontalOutline,
  calendarOutline,
  sparklesOutline,
  checkmarkCircleOutline,
  timeOutline,
  addOutline,
  add,
  chevronForwardOutline,
  analyticsOutline,
  cardOutline,
} from 'ionicons/icons';
import { ChartWrapperComponent } from '../../shared/components/chart-wrapper.component';
import { ChartConfiguration } from 'chart.js';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { TransactionService } from '../../core/services/transaction.service';
import { AccountService } from '../../core/services/account.service';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    ChartWrapperComponent,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header title="Visão Geral">
      <div slot="end" class="flex gap-1 items-center">
        <ion-button fill="clear" class="header-icon-btn" size="small">
          <ion-icon name="notifications-outline" slot="icon-only"></ion-icon>
        </ion-button>
        <ion-button fill="clear" class="header-icon-btn" size="small">
          <ion-icon name="calendar-outline" slot="icon-only"></ion-icon>
        </ion-button>
      </div>
    </app-page-header>

    <ion-content [fullscreen]="true">
      <div class="dash-root">
        <div class="dash-main">
          <div class="greeting-row">
            <div>
              <p class="greeting-sub">
                {{ currentMonthName | titlecase }} ·
                {{ today | date: 'dd MMM' : '' : 'pt-BR' }}
              </p>
              <h1 class="greeting-title">Olá, Investidor</h1>
            </div>
            <button class="add-fab-btn" routerLink="/transactions">
              <ion-icon name="add"></ion-icon>
            </button>
          </div>

          <div class="balance-card">
            <div class="balance-bg-orb orb1"></div>
            <div class="balance-bg-orb orb2"></div>
            <div class="balance-top">
              <div class="balance-icon-wrap">
                <ion-icon name="card-outline"></ion-icon>
              </div>
              <button class="eye-btn" (click)="toggleBalance()">
                <ion-icon
                  [name]="showBalance ? 'eye-outline' : 'eye-off-outline'"
                ></ion-icon>
              </button>
            </div>
            <div class="balance-body">
              <p class="balance-label">Patrimônio total</p>
              <h2 class="balance-amount">
                {{
                  showBalance
                    ? (totalBalance$ | async | currency: 'BRL')
                    : 'R$ ••••••'
                }}
              </h2>
              <div class="balance-change positive">
                <ion-icon name="trending-up-outline"></ion-icon>
                +12% vs mês anterior
              </div>
            </div>
          </div>

          <div class="mini-cards-row">
            <div class="mini-card income-card">
              <div class="mini-card-header">
                <div class="mini-icon income">
                  <ion-icon name="arrow-up"></ion-icon>
                </div>
                <span class="mini-badge income">ENTRADAS</span>
              </div>
              <p class="mini-amount">
                {{
                  showBalance
                    ? (monthlyIncome$ | async | currency: 'BRL')
                    : '••••'
                }}
              </p>
              <p class="mini-sub">Acumulado no mês</p>
            </div>
            <div class="mini-card expense-card">
              <div class="mini-card-header">
                <div class="mini-icon expense">
                  <ion-icon name="arrow-down"></ion-icon>
                </div>
                <span class="mini-badge expense">SAÍDAS</span>
              </div>
              <p class="mini-amount">
                {{
                  showBalance
                    ? (monthlyExpense$ | async | currency: 'BRL')
                    : '••••'
                }}
              </p>
              <p class="mini-sub">Gastos no mês</p>
            </div>
          </div>

          <div class="savings-bar-card">
            <div class="savings-bar-left">
              <div class="savings-icon-box">
                <ion-icon name="sparkles-outline"></ion-icon>
              </div>
              <div>
                <p class="savings-title">Taxa de poupança</p>
                <p class="savings-sub">Quanto da receita foi guardado</p>
              </div>
            </div>
            <span class="savings-pct">{{
              savingsRate$ | async | percent: '1.0-1'
            }}</span>
          </div>
          <div class="savings-track">
            <div
              class="savings-fill"
              [style.width]="(savingsRate$ | async | percent) || '0%'"
            ></div>
          </div>

          <ng-container *ngIf="accounts$ | async as accounts">
            <div class="section-header">
              <span class="section-title">Contas</span>
              <a routerLink="/accounts" class="section-link"
                >Ver todas <ion-icon name="chevron-forward-outline"></ion-icon
              ></a>
            </div>
            <div class="accounts-scroll">
              <div *ngFor="let acc of accounts" class="account-pill">
                <div class="account-pill-top">
                  <ion-icon
                    name="wallet-outline"
                    class="account-pill-icon"
                  ></ion-icon>
                  <span class="account-pill-name">{{ acc.name }}</span>
                </div>
                <span class="account-pill-balance">{{
                  acc.balance | currency: 'BRL'
                }}</span>
              </div>
            </div>
          </ng-container>

          <ng-container *ngIf="recentTransactions$ | async as recents">
            <div class="section-header">
              <span class="section-title">Últimas movimentações</span>
              <a routerLink="/transactions" class="section-link"
                >Ver todas <ion-icon name="chevron-forward-outline"></ion-icon
              ></a>
            </div>
            <div class="recent-list">
              <div *ngFor="let t of recents" class="recent-row">
                <div class="recent-icon" [ngClass]="'recent-icon--' + t.type">
                  <ion-icon
                    [name]="
                      t.type === 'income'
                        ? 'trending-up-outline'
                        : t.type === 'expense'
                          ? 'trending-down-outline'
                          : 'swap-horizontal-outline'
                    "
                  ></ion-icon>
                </div>
                <div class="recent-info">
                  <span class="recent-desc" [class.faded]="!t.isPaid">{{
                    t.description
                  }}</span>
                  <span class="recent-cat">{{ t.categoryId || 'Geral' }}</span>
                </div>
                <div class="recent-right">
                  <span
                    class="recent-amount"
                    [ngClass]="'recent-amount--' + t.type"
                    [class.faded]="!t.isPaid"
                  >
                    {{ t.type === 'expense' ? '-' : '+'
                    }}{{ t.amount | currency: 'BRL' }}
                  </span>
                  <span class="recent-status" [class.scheduled]="!t.isPaid">
                    <ion-icon *ngIf="!t.isPaid" name="time-outline"></ion-icon>
                    {{ !t.isPaid ? 'Agendado' : (t.date | date: 'dd/MM') }}
                  </span>
                </div>
              </div>
              <div *ngIf="recents.length === 0" class="recent-empty">
                Nenhuma transação ainda.
              </div>
            </div>
          </ng-container>
        </div>

        <aside class="dash-sidebar">
          <div class="sidebar-card">
            <div class="sidebar-card-header">
              <ion-icon name="analytics-outline"></ion-icon>
              <span>Por categoria</span>
            </div>
            <div class="chart-wrap doughnut-wrap">
              <app-chart-wrapper
                type="doughnut"
                [labels]="(expenseDistribution$ | async)?.labels || []"
                [data]="(expenseDistribution$ | async)?.data || []"
                [legend]="true"
              >
              </app-chart-wrapper>
            </div>
          </div>

          <div class="sidebar-card">
            <div class="sidebar-card-header">
              <ion-icon name="trending-up-outline"></ion-icon>
              <span>Evolução mensal</span>
            </div>
            <div class="chart-wrap bar-wrap">
              <app-chart-wrapper
                type="bar"
                [labels]="(monthlyTrend$ | async)?.labels || []"
                [data]="(monthlyTrend$ | async)?.expense || []"
                [options]="trendOptions"
                [legend]="false"
              >
              </app-chart-wrapper>
            </div>
          </div>

          <div class="sidebar-card quick-actions">
            <div class="sidebar-card-header">
              <ion-icon name="sparkles-outline"></ion-icon>
              <span>Ações rápidas</span>
            </div>
            <div class="qa-grid">
              <a routerLink="/transactions" class="qa-btn">
                <ion-icon name="add-outline"></ion-icon>
                Nova transação
              </a>
              <a routerLink="/budgets" class="qa-btn">
                <ion-icon name="analytics-outline"></ion-icon>
                Orçamentos
              </a>
              <a routerLink="/accounts" class="qa-btn">
                <ion-icon name="wallet-outline"></ion-icon>
                Contas
              </a>
              <a routerLink="/goals" class="qa-btn">
                <ion-icon name="trending-up-outline"></ion-icon>
                Metas
              </a>
            </div>
          </div>
        </aside>

        <div class="mobile-charts">
          <div class="section-header">
            <span class="section-title">Por categoria</span>
          </div>
          <div class="mobile-chart-card">
            <div class="chart-wrap doughnut-wrap">
              <app-chart-wrapper
                type="doughnut"
                [labels]="(expenseDistribution$ | async)?.labels || []"
                [data]="(expenseDistribution$ | async)?.data || []"
                [legend]="true"
              >
              </app-chart-wrapper>
            </div>
          </div>
          <div class="section-header" style="margin-top:8px">
            <span class="section-title">Evolução mensal</span>
          </div>
          <div class="mobile-chart-card">
            <div class="chart-wrap bar-wrap">
              <app-chart-wrapper
                type="bar"
                [labels]="(monthlyTrend$ | async)?.labels || []"
                [data]="(monthlyTrend$ | async)?.expense || []"
                [options]="trendOptions"
                [legend]="false"
              >
              </app-chart-wrapper>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      ion-content {
        --background: #000000;
        --color: #ffffff;
      }
      .dash-root {
        display: flex;
        gap: 24px;
        max-width: 1280px;
        margin: 0 auto;
        padding: 20px 16px 80px;
        align-items: flex-start;
      }
      .dash-main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .dash-sidebar {
        display: none;
        width: 320px;
        flex-shrink: 0;
        position: sticky;
        top: 20px;
        flex-direction: column;
        gap: 16px;
      }
      .mobile-charts {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      @media (min-width: 960px) {
        .dash-sidebar {
          display: flex;
        }
        .mobile-charts {
          display: none;
        }
      }
      .header-icon-btn {
        color: #a1a1aa;
      }
      .greeting-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }
      .greeting-sub {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #71717a;
        margin: 0;
      }
      .greeting-title {
        font-size: 26px;
        font-weight: 800;
        color: #ffffff;
        margin: 4px 0 0;
      }
      .add-fab-btn {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: #4f46e5;
        color: white;
        border: none;
        font-size: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 0 20px rgba(79, 70, 229, 0.4);
        transition: all 0.2s;
      }
      .add-fab-btn:hover {
        background: #4338ca;
        transform: scale(1.05);
      }
      .add-fab-btn:active {
        transform: scale(0.95);
      }
      .balance-card {
        position: relative;
        overflow: hidden;
        border-radius: 24px;
        background: linear-gradient(
          145deg,
          #0f0c29 0%,
          #1a1052 50%,
          #312e81 100%
        );
        padding: 24px;
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .balance-bg-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(50px);
        pointer-events: none;
      }
      .orb1 {
        width: 180px;
        height: 180px;
        background: rgba(99, 102, 241, 0.2);
        top: -60px;
        right: -40px;
      }
      .orb2 {
        width: 120px;
        height: 120px;
        background: rgba(79, 70, 229, 0.15);
        bottom: -30px;
        left: 20px;
      }
      .balance-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
        position: relative;
        z-index: 1;
      }
      .balance-icon-wrap {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(8px);
        border-radius: 12px;
        padding: 10px;
        font-size: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .eye-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.5);
        font-size: 20px;
        cursor: pointer;
        padding: 4px;
      }
      .eye-btn:hover {
        color: white;
      }
      .balance-body {
        position: relative;
        z-index: 1;
      }
      .balance-label {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.6);
        margin: 0 0 4px;
      }
      .balance-amount {
        font-size: 36px;
        font-weight: 800;
        margin: 0 0 16px;
        letter-spacing: -0.5px;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      }
      .balance-change {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        padding: 6px 12px;
        border-radius: 20px;
        backdrop-filter: blur(8px);
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.2);
      }
      .mini-cards-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .mini-card {
        background: #121212;
        border-radius: 20px;
        padding: 18px 16px;
        border: 1px solid #27272a;
      }
      .mini-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
      }
      .mini-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      }
      .mini-icon.income {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
      }
      .mini-icon.expense {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
      }
      .mini-badge {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.07em;
        padding: 3px 8px;
        border-radius: 6px;
      }
      .mini-badge.income {
        background: rgba(16, 185, 129, 0.1);
        color: #34d399;
      }
      .mini-badge.expense {
        background: rgba(239, 68, 68, 0.1);
        color: #f87171;
      }
      .mini-amount {
        font-size: 18px;
        font-weight: 800;
        color: #ffffff;
        margin: 0 0 4px;
      }
      .mini-sub {
        font-size: 12px;
        color: #71717a;
        margin: 0;
      }
      .savings-bar-card {
        background: #121212;
        border: 1px solid #27272a;
        border-radius: 16px;
        padding: 14px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }
      .savings-bar-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .savings-icon-box {
        width: 36px;
        height: 36px;
        background: rgba(79, 70, 229, 0.15);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .savings-bar-left ion-icon {
        font-size: 18px;
        color: #818cf8;
      }
      .savings-title {
        font-size: 14px;
        font-weight: 700;
        color: #e4e4e7;
        margin: 0;
      }
      .savings-sub {
        font-size: 11px;
        color: #71717a;
        margin: 2px 0 0;
      }
      .savings-pct {
        font-size: 20px;
        font-weight: 900;
        color: #818cf8;
        white-space: nowrap;
      }
      .savings-track {
        height: 6px;
        background: #27272a;
        border-radius: 99px;
        overflow: hidden;
        margin-top: -8px;
      }
      .savings-fill {
        height: 100%;
        background: linear-gradient(90deg, #6366f1, #818cf8);
        border-radius: 99px;
        transition: width 1s ease;
      }
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 2px;
      }
      .section-title {
        font-size: 13px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: #71717a;
      }
      .section-link {
        font-size: 12px;
        font-weight: 600;
        color: #818cf8;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 2px;
      }
      .section-link:hover {
        color: #a5b4fc;
      }
      .accounts-scroll {
        display: flex;
        gap: 10px;
        overflow-x: auto;
        padding-bottom: 4px;
        scrollbar-width: none;
      }
      .account-pill {
        background: #121212;
        border: 1px solid #27272a;
        border-radius: 16px;
        padding: 14px 16px;
        min-width: 140px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        transition: border-color 0.2s;
      }
      .account-pill:hover {
        border-color: #3f3f46;
      }
      .account-pill-top {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .account-pill-icon {
        font-size: 14px;
        color: #818cf8;
      }
      .account-pill-name {
        font-size: 12px;
        font-weight: 600;
        color: #a1a1aa;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .account-pill-balance {
        font-size: 16px;
        font-weight: 800;
        color: #ffffff;
      }
      .recent-list {
        background: #121212;
        border: 1px solid #27272a;
        border-radius: 20px;
        overflow: hidden;
      }
      .recent-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border-bottom: 1px solid #1f1f22;
        transition: background 0.15s;
      }
      .recent-row:last-child {
        border-bottom: none;
      }
      .recent-row:hover {
        background: #18181b;
      }
      .recent-icon {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
      }
      .recent-icon--income {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
      }
      .recent-icon--expense {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
      }
      .recent-icon--transfer {
        background: rgba(59, 130, 246, 0.15);
        color: #60a5fa;
      }
      .recent-info {
        flex: 1;
        min-width: 0;
      }
      .recent-desc {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #e4e4e7;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .recent-desc.faded,
      .recent-amount.faded {
        opacity: 0.5;
        color: #71717a;
      }
      .recent-cat {
        font-size: 11px;
        color: #71717a;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        font-weight: 500;
      }
      .recent-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
        flex-shrink: 0;
      }
      .recent-amount {
        font-size: 14px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }
      .recent-amount--income {
        color: #34d399;
      }
      .recent-amount--expense {
        color: #f87171;
      }
      .recent-amount--transfer {
        color: #a1a1aa;
      }
      .recent-status {
        font-size: 11px;
        color: #52525b;
        display: flex;
        align-items: center;
        gap: 3px;
      }
      .recent-status.scheduled {
        color: #fbbf24;
        background: rgba(251, 191, 36, 0.1);
        padding: 2px 7px;
        border-radius: 20px;
        font-weight: 700;
      }
      .recent-empty {
        padding: 32px;
        text-align: center;
        color: #52525b;
        font-size: 14px;
      }
      .sidebar-card,
      .mobile-chart-card {
        background: #121212;
        border: 1px solid #27272a;
        border-radius: 20px;
        padding: 20px;
      }
      .sidebar-card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: #71717a;
        margin-bottom: 16px;
      }
      .sidebar-card-header ion-icon {
        font-size: 16px;
        color: #818cf8;
      }
      .chart-wrap {
        position: relative;
      }
      .doughnut-wrap {
        height: 220px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .bar-wrap {
        height: 180px;
      }
      .qa-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .qa-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 14px 8px;
        border-radius: 14px;
        background: #18181b;
        color: #a1a1aa;
        font-size: 11px;
        font-weight: 700;
        text-align: center;
        text-decoration: none;
        transition: all 0.15s;
        border: 1px solid #27272a;
      }
      .qa-btn ion-icon {
        font-size: 20px;
        color: #818cf8;
      }
      .qa-btn:hover {
        background: #27272a;
        border-color: #3f3f46;
        color: white;
      }
    `,
  ],
})
export class DashboardPage implements OnInit {
  showBalance = true;
  currentMonthName = '';
  today = new Date();

  totalBalance$!: Observable<number>;
  monthlyIncome$!: Observable<number>;
  monthlyExpense$!: Observable<number>;
  savingsRate$!: Observable<number>;
  accounts$!: Observable<any[]>;
  recentTransactions$!: Observable<any[]>;
  expenseDistribution$!: Observable<{ labels: string[]; data: number[] }>;
  monthlyTrend$!: Observable<{
    labels: string[];
    income: number[];
    expense: number[];
  }>;

  trendOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#71717a' },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { display: false },
      },
    },
    elements: { bar: { borderRadius: 6 } },
  };

  constructor(
    private transactionService: TransactionService,
    private accountService: AccountService,
    private analyticsService: AnalyticsService,
  ) {
    addIcons({
      eyeOutline,
      eyeOffOutline,
      trendingUpOutline,
      trendingDownOutline,
      notificationsOutline,
      walletOutline,
      arrowUp,
      arrowDown,
      swapHorizontalOutline,
      calendarOutline,
      sparklesOutline,
      checkmarkCircleOutline,
      timeOutline,
      addOutline,
      add,
      chevronForwardOutline,
      analyticsOutline,
      cardOutline,
    });
  }

  ngOnInit() {
    const now = new Date();
    this.currentMonthName = now.toLocaleString('pt-BR', { month: 'long' });
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentYearStr = `${now.getFullYear()}`;

    this.totalBalance$ = this.accountService.accounts$.pipe(
      map((accounts) => accounts.reduce((acc, a) => acc + a.balance, 0)),
    );
    this.accounts$ = this.accountService.accounts$;

    const monthTxs$ = this.transactionService.transactions$.pipe(
      map((ts) => ts.filter((t) => t.date.startsWith(currentMonthStr))),
    );

    this.monthlyIncome$ = monthTxs$.pipe(
      map((ts) =>
        ts
          .filter((t) => t.type === 'income' && t.isPaid)
          .reduce((a, t) => a + t.amount, 0),
      ),
    );
    this.monthlyExpense$ = monthTxs$.pipe(
      map((ts) =>
        ts
          .filter((t) => t.type === 'expense' && t.isPaid)
          .reduce((a, t) => a + t.amount, 0),
      ),
    );
    this.savingsRate$ = combineLatest([
      this.monthlyIncome$,
      this.monthlyExpense$,
    ]).pipe(
      map(([inc, exp]) => (inc === 0 ? 0 : Math.max(0, (inc - exp) / inc))),
    );
    this.recentTransactions$ = this.transactionService.getRecentTransactions(6);
    this.expenseDistribution$ = this.analyticsService
      .getCategoryDistribution(currentMonthStr)
      .pipe(
        map((data) => ({
          labels: data.map((d) => d.label),
          data: data.map((d) => d.data),
        })),
      );
    this.monthlyTrend$ =
      this.analyticsService.getMonthlyEvolution(currentYearStr);
  }

  toggleBalance() {
    this.showBalance = !this.showBalance;
  }
}