import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../../core/services/budget.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { Observable } from 'rxjs';
import { addIcons } from 'ionicons';
import { closeOutline, checkmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-add-budget-modal',
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
        <ion-title>Set Budget</ion-title>
        <ion-buttons slot="end">
          <ion-button
            (click)="save()"
            [disabled]="!amount || !selectedCategoryId"
          >
            <ion-icon name="checkmark-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
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
          <ion-label position="stacked">Monthly Limit</ion-label>
          <ion-input
            type="number"
            [(ngModel)]="amount"
            placeholder="0.00"
          ></ion-input>
        </ion-item>

        <p class="ion-padding-start text-sm text-gray-500 mt-2">
          This budget will apply to the current month and future months unless
          changed.
        </p>
      </ion-list>
    </ion-content>
  `,
})
export class AddBudgetModalComponent implements OnInit {
  amount: number | null = null;
  selectedCategoryId: string = '';

  categories$: Observable<Category[]>;

  constructor(
    private modalCtrl: ModalController,
    private budgetService: BudgetService,
    private categoryService: CategoryService,
  ) {
    addIcons({ closeOutline, checkmarkOutline });
    this.categories$ = this.categoryService.categories$;
  }

  ngOnInit() {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async save() {
    if (!this.amount || !this.selectedCategoryId) return;

    await this.budgetService.addBudget({
      amount: this.amount,
      categoryId: this.selectedCategoryId,
      period: 'monthly',
      // month: currentMonth // Could support specific months
    });

    this.dismiss();
  }
}
