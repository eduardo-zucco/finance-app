import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../../core/services/budget.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { Observable } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  checkmarkOutline,
  pricetagOutline,
  calendarOutline,
  checkmarkCircleOutline,
  sparklesOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-add-budget-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="dismiss()" fill="clear" color="medium">
            <ion-icon name="close-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title class="modal-title text-white">Novo Orçamento</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [scrollY]="true">
      <div class="amount-hero">
        <div class="hero-glow"></div>
        <p class="amount-label">Limite Mensal</p>
        <div class="amount-row">
          <span class="amount-prefix">R$</span>
          <input
            type="number"
            [(ngModel)]="amount"
            placeholder="0,00"
            inputmode="decimal"
            class="amount-input"
            autofocus
          />
        </div>
        <div class="amount-hint" *ngIf="amount && amount > 0">
          <ion-icon name="sparkles-outline"></ion-icon>
          Teto de {{ amount | currency: 'BRL' }} por mês
        </div>
      </div>

      <div class="fields-container">
        <div class="fields-list">
          <div class="field-row" [class.filled]="selectedCategoryId">
            <div class="field-icon pink">
              <ion-icon name="pricetag-outline"></ion-icon>
            </div>
            <div class="field-body">
              <p class="field-label text-zinc-500">Categoria</p>
              <ion-select
                [(ngModel)]="selectedCategoryId"
                interface="action-sheet"
                placeholder="Selecione a categoria"
                class="field-select text-white"
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

          <div class="field-row filled">
            <div class="field-icon indigo">
              <ion-icon name="calendar-outline"></ion-icon>
            </div>
            <div class="field-body">
              <p class="field-label text-zinc-500">Recorrência</p>
              <p class="field-value text-zinc-200">
                Mensal · Renovação automática
              </p>
            </div>
          </div>
        </div>

        <div
          class="preview-card"
          *ngIf="amount && amount > 0 && selectedCategoryId"
        >
          <div class="preview-header">
            <span class="preview-title text-zinc-500">SIMULAÇÃO</span>
            <span class="preview-badge">0% UTILIZADO</span>
          </div>
          <div class="preview-bar-track">
            <div class="preview-bar-fill"></div>
          </div>
          <div class="preview-values">
            <span class="preview-spent text-emerald-400">R$ 0,00 gastos</span>
            <span class="preview-limit text-zinc-500"
              >limite {{ amount | currency: 'BRL' }}</span
            >
          </div>
        </div>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border">
      <div class="footer-wrap bg-black">
        <ion-button
          expand="block"
          (click)="save()"
          [disabled]="!isValid()"
          class="save-btn shadow-indigo"
        >
          <ion-icon name="checkmark-outline" slot="start"></ion-icon>
          {{ isValid() ? 'Salvar Orçamento' : 'Preencha o valor' }}
        </ion-button>
      </div>
    </ion-footer>
  `,
  styles: [
    `
      /* ── Reset Dark Base ── */
      ion-content {
        --background: #000000;
      }

      ion-toolbar {
        --background: #000000;
        --color: #ffffff;
        --border-color: transparent;
      }

      .modal-title {
        font-size: 14px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* ── Hero Section (Deep Indigo) ── */
      .amount-hero {
        position: relative;
        background: linear-gradient(180deg, #0f172a 0%, #000000 100%);
        padding: 40px 24px 48px;
        text-align: center;
        overflow: hidden;
      }

      .hero-glow {
        position: absolute;
        top: -50px;
        left: 50%;
        transform: translateX(-50%);
        width: 200px;
        height: 100px;
        background: #4f46e5;
        filter: blur(80px);
        opacity: 0.3;
        pointer-events: none;
      }

      .amount-label {
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: #6366f1;
        margin: 0 0 12px;
      }

      .amount-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .amount-prefix {
        font-size: 24px;
        font-weight: 700;
        color: #3f3f46;
        margin-top: 8px;
      }

      .amount-input {
        font-size: 56px;
        font-weight: 900;
        color: #ffffff;
        background: transparent;
        border: none;
        outline: none;
        text-align: center;
        width: 240px;
        letter-spacing: -2px;
      }

      .amount-input::placeholder {
        color: #18181b;
      }

      .amount-input::-webkit-inner-spin-button,
      .amount-input::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      .amount-hint {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-top: 20px;
        font-size: 12px;
        font-weight: 700;
        color: #818cf8;
        background: rgba(99, 102, 241, 0.1);
        padding: 6px 16px;
        border-radius: 99px;
        border: 1px solid rgba(99, 102, 241, 0.2);
      }

      /* ── Form Fields (Black Surface) ── */
      .fields-container {
        padding: 0 16px;
        margin-top: -20px;
        position: relative;
        z-index: 10;
      }

      .fields-list {
        background: #121212;
        border-radius: 24px;
        border: 1px solid #27272a;
        overflow: hidden;
        margin-bottom: 16px;
      }

      .field-row {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        border-bottom: 1px solid #1c1c1f;
      }

      .field-row:last-child {
        border-bottom: none;
      }

      .field-icon {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
      }

      .field-icon.pink {
        background: rgba(219, 39, 119, 0.15);
        color: #f472b6;
      }

      .field-icon.indigo {
        background: rgba(79, 70, 229, 0.15);
        color: #818cf8;
      }

      .field-body {
        flex: 1;
      }

      .field-label {
        font-size: 10px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin: 0 0 4px;
      }

      .field-select {
        --padding-start: 0;
        font-size: 16px;
        font-weight: 700;
        margin-left: -4px;
      }

      /* ── Preview Card ── */
      .preview-card {
        background: #121212;
        border: 1px solid #27272a;
        border-radius: 24px;
        padding: 20px;
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .preview-title {
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.12em;
      }

      .preview-badge {
        font-size: 10px;
        font-weight: 800;
        color: #10b981;
        background: rgba(16, 185, 129, 0.1);
        padding: 4px 12px;
        border-radius: 99px;
        border: 1px solid rgba(16, 185, 129, 0.2);
      }

      .preview-bar-track {
        height: 8px;
        background: #1c1c1f;
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 12px;
      }

      .preview-bar-fill {
        width: 4%;
        height: 100%;
        background: #10b981;
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
        border-radius: 10px;
      }

      .preview-values {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        font-weight: 700;
      }

      /* ── Footer & Action ── */
      ion-footer {
        background: #000000;
      }

      .footer-wrap {
        padding: 16px 24px calc(24px + env(safe-area-inset-bottom));
      }

      .save-btn {
        --background: #4f46e5;
        --color: #ffffff;
        --border-radius: 18px;
        height: 56px;
        font-size: 16px;
        font-weight: 800;
        margin: 0;
      }

      .shadow-indigo {
        box-shadow: 0 8px 24px rgba(79, 70, 229, 0.3);
      }

      ion-button[disabled] {
        --opacity: 0.3;
        box-shadow: none;
      }
    `,
  ],
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
    addIcons({
      closeOutline,
      checkmarkOutline,
      pricetagOutline,
      calendarOutline,
      checkmarkCircleOutline,
      sparklesOutline,
    });
    this.categories$ = this.categoryService.categories$;
  }

  ngOnInit() {}

  isValid(): boolean {
    return !!this.amount && this.amount > 0 && !!this.selectedCategoryId;
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async save() {
    if (!this.isValid()) return;

    await this.budgetService.addBudget({
      amount: this.amount!,
      categoryId: this.selectedCategoryId,
      period: 'monthly',
    });

    this.dismiss();
  }
}
