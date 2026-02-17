import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TransactionService } from '../../core/services/transaction.service';
import { AccountService } from '../../core/services/account.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import {
  walletOutline,
  arrowDownCircleOutline,
  arrowUpCircleOutline,
  trendingUpOutline,
  settingsOutline,
} from 'ionicons/icons';
import { RouterModule } from '@angular/router';
import { ChartWrapperComponent } from '../../shared/components/chart-wrapper.component';
import { ChartConfiguration } from 'chart.js';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

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
    <app-page-header title="FindDash">
      <div slot="end">
        <ion-button routerLink="/settings" fill="clear">
          <ion-icon
            name="settings-outline"
            slot="icon-only"
            class="text-gray-600 dark:text-gray-300"
          ></ion-icon>
        </ion-button>
      </div>
    </app-page-header>

    <ion-content class="ion-padding bg-gray-50 dark:bg-gray-900">
      <!-- Welcome Section -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
          Welcome back!
        </h1>
        <p class="text-gray-500 dark:text-gray-400">
          Here's your financial overview.
        </p>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <!-- Total Balance -->
        <ion-card
          class="m-0 bg-blue-600 text-white shadow-lg transform transition-all hover:scale-105"
        >
          <ion-card-content>
            <div class="flex justify-between items-start">
              <div>
                <p class="text-blue-100 text-sm font-medium">Total Balance</p>
                <h2 class="text-3xl font-bold mt-1">
                  {{ totalBalance$ | async | currency }}
                </h2>
              </div>
              <ion-icon
                name="wallet-outline"
                class="text-3xl opacity-80"
              ></ion-icon>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Monthly Income -->
        <ion-card class="m-0 bg-white dark:bg-gray-800 shadow-md">
          <ion-card-content>
            <div class="flex items-center space-x-4">
              <div class="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <ion-icon
                  name="arrow-up-circle-outline"
                  class="text-2xl text-green-600 dark:text-green-400"
                ></ion-icon>
              </div>
              <div>
                <p class="text-gray-500 dark:text-gray-400 text-sm">Income</p>
                <h3 class="text-xl font-bold text-gray-800 dark:text-white">
                  {{ monthlyIncome$ | async | currency }}
                </h3>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Monthly Expense -->
        <ion-card class="m-0 bg-white dark:bg-gray-800 shadow-md">
          <ion-card-content>
            <div class="flex items-center space-x-4">
              <div class="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <ion-icon
                  name="arrow-down-circle-outline"
                  class="text-2xl text-red-600 dark:text-red-400"
                ></ion-icon>
              </div>
              <div>
                <p class="text-gray-500 dark:text-gray-400 text-sm">Expenses</p>
                <h3 class="text-xl font-bold text-gray-800 dark:text-white">
                  {{ monthlyExpense$ | async | currency }}
                </h3>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Savings Prompt -->
      <div
        class="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-between"
      >
        <div class="flex items-center space-x-3">
          <ion-icon
            name="trending-up-outline"
            class="text-xl text-indigo-600 dark:text-indigo-400"
          ></ion-icon>
          <div>
            <p class="font-semibold text-indigo-900 dark:text-indigo-300">
              Savings Rate
            </p>
            <p class="text-sm text-indigo-700 dark:text-indigo-400">
              You saved {{ savingsRate$ | async | percent: '1.0-1' }} of your
              income this month.
            </p>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ion-card class="m-0">
          <ion-card-header>
            <ion-card-title>Expenses by Category</ion-card-title>
          </ion-card-header>
          <ion-card-content class="h-64 relative bg-white dark:bg-gray-800">
            <app-chart-wrapper
              type="doughnut"
              [labels]="(expenseDistribution$ | async)?.labels || []"
              [data]="(expenseDistribution$ | async)?.data || []"
              [legend]="true"
            >
            </app-chart-wrapper>
          </ion-card-content>
        </ion-card>
        <ion-card class="m-0">
          <ion-card-header>
            <ion-card-title>Monthly Trend</ion-card-title>
          </ion-card-header>
          <ion-card-content class="h-64 relative bg-white dark:bg-gray-800">
            <app-chart-wrapper
              type="bar"
              [labels]="(monthlyTrend$ | async)?.labels || []"
              [data]="(monthlyTrend$ | async)?.expense || []"
              [options]="trendOptions"
              [legend]="false"
            >
            </app-chart-wrapper>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      ion-card {
        border-radius: 16px;
      }
    `,
  ],
})
export class DashboardPage implements OnInit {
  totalBalance$!: Observable<number>;
  monthlyIncome$!: Observable<number>;
  monthlyExpense$!: Observable<number>;
  savingsRate$!: Observable<number>;

  expenseDistribution$!: Observable<{ labels: string[]; data: number[] }>;
  monthlyTrend$!: Observable<{
    labels: string[];
    income: number[];
    expense: number[];
  }>;

  trendOptions: ChartConfiguration['options'] = {
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
  };

  constructor(
    private transactionService: TransactionService,
    private accountService: AccountService,
    private analyticsService: AnalyticsService,
  ) {
    addIcons({
      walletOutline,
      arrowDownCircleOutline,
      arrowUpCircleOutline,
      trendingUpOutline,
      settingsOutline,
    });
  }

  ngOnInit() {
    this.totalBalance$ = this.accountService.accounts$.pipe(
      map((accounts) => accounts.reduce((acc, a) => acc + a.balance, 0)),
    );

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentYear = `${now.getFullYear()}`;

    const monthTransactions$ = this.transactionService.transactions$.pipe(
      map((transactions) =>
        transactions.filter((t) => t.date.startsWith(currentMonth)),
      ),
    );

    this.monthlyIncome$ = monthTransactions$.pipe(
      map((ts) =>
        ts
          .filter((t) => t.type === 'income')
          .reduce((acc, t) => acc + t.amount, 0),
      ),
    );

    this.monthlyExpense$ = monthTransactions$.pipe(
      map((ts) =>
        ts
          .filter((t) => t.type === 'expense')
          .reduce((acc, t) => acc + t.amount, 0),
      ),
    );

    this.savingsRate$ = combineLatest([
      this.monthlyIncome$,
      this.monthlyExpense$,
    ]).pipe(
      map(([income, expense]) => {
        if (income === 0) return 0;
        return (income - expense) / income;
      }),
    );

    this.expenseDistribution$ = this.analyticsService
      .getCategoryDistribution(currentMonth)
      .pipe(
        map((data) => ({
          labels: data.map((d) => d.label),
          data: data.map((d) => d.data),
        })),
      );

    this.monthlyTrend$ = this.analyticsService.getMonthlyEvolution(currentYear);
  }
}
