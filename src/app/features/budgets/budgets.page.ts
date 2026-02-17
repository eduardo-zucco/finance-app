import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import {
  BudgetService,
  BudgetStatus,
} from '../../core/services/budget.service';
import { Observable } from 'rxjs';
import { AddBudgetModalComponent } from './components/add-budget-modal.component';
import { addIcons } from 'ionicons';
import { addOutline, warningOutline, alertCircleOutline } from 'ionicons/icons';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent],
  template: `
    <app-page-header title="Budgets"></app-page-header>

    <ion-content class="ion-padding bg-gray-50 dark:bg-gray-900">
      <div *ngIf="budgetStatus$ | async as statusList">
        <div
          *ngFor="let item of statusList"
          class="mb-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
        >
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-gray-800 dark:text-white">
              {{ getCategoryName(item.budget.categoryId) }}
            </h3>
            <span
              class="text-xs font-semibold px-2 py-1 rounded-full"
              [ngClass]="{
                'bg-green-100 text-green-700': item.status === 'normal',
                'bg-yellow-100 text-yellow-700': item.status === 'warning',
                'bg-red-100 text-red-700': item.status === 'exceeded',
              }"
            >
              {{ item.status | titlecase }}
            </span>
          </div>

          <div class="mb-2">
            <div class="flex justify-between text-sm text-gray-500 mb-1">
              <span>{{ item.spent | currency }} spent</span>
              <span>{{ item.budget.amount | currency }} limit</span>
            </div>
            <ion-progress-bar
              [value]="getProgressBarValue(item)"
              [color]="getProgressBarColor(item.status)"
            ></ion-progress-bar>
          </div>

          <div class="text-right">
            <span
              class="text-sm font-medium"
              [ngClass]="item.remaining < 0 ? 'text-red-500' : 'text-gray-500'"
            >
              {{ item.remaining < 0 ? 'Over by ' : 'Remaining: ' }}
              {{ Math.abs(item.remaining) | currency }}
            </span>
          </div>
        </div>

        <div
          *ngIf="statusList.length === 0"
          class="text-center p-8 text-gray-500"
        >
          <p>No budgets set for this month.</p>
        </div>
      </div>

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
})
export class BudgetsPage implements OnInit {
  budgetStatus$: Observable<BudgetStatus[]>;
  Math = Math; // Make Math available in template

  constructor(
    private budgetService: BudgetService,
    private modalCtrl: ModalController,
    // In real app, inject CategoryService to get names
  ) {
    addIcons({ addOutline, warningOutline, alertCircleOutline });
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.budgetStatus$ = this.budgetService.getBudgetStatus(currentMonth);
  }

  ngOnInit() {}

  // Placeholder for category name - ideally fetch from service
  getCategoryName(id: string): string {
    // This is a temporary hack.
    // In a real app we'd use a pipe or combined stream
    return 'Category';
  }

  getProgressBarValue(item: BudgetStatus): number {
    return Math.min(item.percentage / 100, 1);
  }

  getProgressBarColor(status: string): string {
    switch (status) {
      case 'warning':
        return 'warning';
      case 'exceeded':
        return 'danger';
      default:
        return 'success';
    }
  }

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: AddBudgetModalComponent,
    });
    await modal.present();
  }
}
