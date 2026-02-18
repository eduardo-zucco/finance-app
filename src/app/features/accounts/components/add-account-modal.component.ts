import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../../core/services/account.service';
import { AccountType } from '../../../core/models/account.model';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  checkmarkOutline,
  cashOutline,
  cardOutline,
  walletOutline,
  trendingUpOutline,
  businessOutline,
  textOutline,
} from 'ionicons/icons';

interface AccountTypeOption {
  value: AccountType;
  label: string;
  icon: string;
  color: string;
  bg: string;
}

@Component({
  selector: 'app-add-account-modal',
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
        <ion-title class="modal-title">Nova Conta</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [scrollY]="true">
      <!-- Preview da conta -->
      <div
        class="account-preview"
        [style.background]="selectedType.color + '18'"
      >
        <div
          class="preview-icon-wrap"
          [style.background]="selectedType.color + '22'"
        >
          <ion-icon
            [name]="selectedType.icon"
            [style.color]="selectedType.color"
          ></ion-icon>
        </div>
        <div class="preview-info">
          <p class="preview-name">{{ name || 'Nome da conta' }}</p>
          <p class="preview-type">{{ selectedType.label }}</p>
        </div>
        <div class="preview-balance" [style.color]="selectedType.color">
          {{ balance || 0 | currency: 'BRL' }}
        </div>
      </div>

      <!-- Seletor de tipo -->
      <div class="section-wrap">
        <p class="section-label">Tipo de conta</p>
        <div class="type-grid">
          <button
            *ngFor="let t of typeOptions"
            class="type-btn"
            [class.active]="type === t.value"
            [style.--accent]="t.color"
            (click)="selectType(t)"
          >
            <div
              class="type-btn-icon"
              [style.background]="type === t.value ? t.color + '22' : ''"
            >
              <ion-icon
                [name]="t.icon"
                [style.color]="type === t.value ? t.color : ''"
              ></ion-icon>
            </div>
            <span>{{ t.label }}</span>
          </button>
        </div>
      </div>

      <!-- Campos -->
      <div class="fields-wrap">
        <!-- Nome -->
        <div class="field-row" [class.has-value]="name">
          <div class="field-icon" style="background:#fef3c7">
            <ion-icon name="text-outline" style="color:#d97706"></ion-icon>
          </div>
          <div class="field-body">
            <p class="field-label">Nome da conta</p>
            <input
              type="text"
              [(ngModel)]="name"
              placeholder="Ex: Nubank, Carteira..."
              class="field-input"
            />
          </div>
        </div>

        <!-- Saldo inicial -->
        <div class="field-row" [class.has-value]="balance > 0">
          <div class="field-icon" style="background:#d1fae5">
            <ion-icon name="cash-outline" style="color:#059669"></ion-icon>
          </div>
          <div class="field-body">
            <p class="field-label">Saldo inicial</p>
            <div class="balance-input-row">
              <span class="balance-prefix">R$</span>
              <input
                type="number"
                [(ngModel)]="balance"
                placeholder="0,00"
                inputmode="decimal"
                class="field-input balance-input"
              />
            </div>
          </div>
        </div>

        <!-- Cor -->
        <div class="field-row">
          <div class="field-icon" [style.background]="color + '22'">
            <div class="color-dot" [style.background]="color"></div>
          </div>
          <div class="field-body">
            <p class="field-label">Cor de identificação</p>
            <div class="color-row">
              <button
                *ngFor="let c of colorOptions"
                class="color-swatch"
                [class.selected]="color === c"
                [style.background]="c"
                (click)="color = c"
              ></button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border">
      <div class="footer-wrap">
        <ion-button
          expand="block"
          (click)="save()"
          [disabled]="!name.trim()"
          color="primary"
          shape="round"
          class="save-btn"
        >
          <ion-icon name="checkmark-outline" slot="start"></ion-icon>
          {{ name.trim() ? 'Criar conta' : 'Informe o nome' }}
        </ion-button>
      </div>
    </ion-footer>
  `,
  styles: [
    `
      ion-content {
        --background: #111827;
      }
      ion-toolbar {
        --background: #111827;
        --border-color: transparent;
      }

      .modal-title {
        font-size: 15px;
        font-weight: 700;
        color: #e5e7eb;
      }

      /* ── Preview ── */
      .account-preview {
        margin: 12px 16px;
        border-radius: 20px;
        padding: 18px 20px;
        display: flex;
        align-items: center;
        gap: 14px;
        transition: background 0.3s;
        border: 1px solid rgba(255, 255, 255, 0.06);
      }

      .preview-icon-wrap {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        flex-shrink: 0;
        transition: all 0.3s;
      }

      .preview-info {
        flex: 1;
        min-width: 0;
      }
      .preview-name {
        font-size: 16px;
        font-weight: 700;
        color: #f9fafb;
        margin: 0 0 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .preview-type {
        font-size: 12px;
        color: #6b7280;
        margin: 0;
        font-weight: 500;
      }
      .preview-balance {
        font-size: 18px;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        flex-shrink: 0;
        transition: color 0.3s;
      }

      /* ── Type selector ── */
      .section-wrap {
        padding: 16px 16px 8px;
      }

      .section-label {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #4b5563;
        margin: 0 0 12px 4px;
      }

      .type-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 8px;
      }

      .type-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 10px 4px;
        border-radius: 14px;
        background: #1f2937;
        border: 1.5px solid #2d3748;
        cursor: pointer;
        transition: all 0.18s;
        font-size: 10px;
        font-weight: 600;
        color: #6b7280;
      }

      .type-btn.active {
        border-color: var(--accent);
        background: color-mix(in srgb, var(--accent) 12%, #1f2937);
        color: #e5e7eb;
      }

      .type-btn-icon {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        background: #374151;
        transition: all 0.18s;
      }

      .type-btn ion-icon {
        color: #6b7280;
        transition: color 0.18s;
      }

      /* ── Fields ── */
      .fields-wrap {
        margin: 8px 16px 16px;
        background: #1f2937;
        border-radius: 20px;
        border: 1px solid #2d3748;
        overflow: hidden;
      }

      .field-row {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px 18px;
        border-bottom: 1px solid #2d3748;
        transition: background 0.15s;
      }
      .field-row:last-child {
        border-bottom: none;
      }
      .field-row:hover {
        background: #252d3d;
      }

      .field-icon {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
      }

      .color-dot {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.2);
        transition: background 0.2s;
      }

      .field-body {
        flex: 1;
        min-width: 0;
      }

      .field-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #4b5563;
        margin: 0 0 4px;
      }

      .field-input {
        width: 100%;
        background: transparent;
        border: none;
        outline: none;
        font-size: 15px;
        font-weight: 600;
        color: #f9fafb;
      }
      .field-input::placeholder {
        color: #374151;
        font-weight: 400;
      }
      .field-input::-webkit-inner-spin-button,
      .field-input::-webkit-outer-spin-button {
        -webkit-appearance: none;
      }
      .field-input {
        -moz-appearance: textfield;
      }

      .balance-input-row {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .balance-prefix {
        font-size: 14px;
        color: #6b7280;
        font-weight: 600;
      }
      .balance-input {
        flex: 1;
      }

      /* ── Color swatches ── */
      .color-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        padding-top: 2px;
      }

      .color-swatch {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.15s;
        flex-shrink: 0;
      }

      .color-swatch.selected {
        border-color: white;
        transform: scale(1.2);
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15);
      }

      /* ── Footer ── */
      ion-footer {
        background: #111827;
        border-top: 1px solid #1f2937;
      }

      .footer-wrap {
        padding: 14px 20px calc(14px + env(safe-area-inset-bottom));
      }

      .save-btn {
        --border-radius: 99px;
        height: 52px;
        font-size: 15px;
        font-weight: 700;
      }
    `,
  ],
})
export class AddAccountModalComponent implements OnInit {
  name: string = '';
  type: AccountType = 'cash';
  balance: number = 0;
  color: string = '#6366f1';

  typeOptions: AccountTypeOption[] = [
    {
      value: 'cash',
      label: 'Dinheiro',
      icon: 'cash-outline',
      color: '#10b981',
      bg: '#d1fae5',
    },
    {
      value: 'bank',
      label: 'Banco',
      icon: 'business-outline',
      color: '#3b82f6',
      bg: '#dbeafe',
    },
    {
      value: 'card',
      label: 'Cartão',
      icon: 'card-outline',
      color: '#8b5cf6',
      bg: '#ede9fe',
    },
    {
      value: 'savings',
      label: 'Poupança',
      icon: 'wallet-outline',
      color: '#f59e0b',
      bg: '#fef3c7',
    },
    {
      value: 'investment',
      label: 'Invest.',
      icon: 'trending-up-outline',
      color: '#ef4444',
      bg: '#fee2e2',
    },
  ];

  colorOptions = [
    '#6366f1',
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
  ];

  get selectedType(): AccountTypeOption {
    return (
      this.typeOptions.find((t) => t.value === this.type) ?? this.typeOptions[0]
    );
  }

  constructor(
    private modalCtrl: ModalController,
    private accountService: AccountService,
  ) {
    addIcons({
      closeOutline,
      checkmarkOutline,
      cashOutline,
      cardOutline,
      walletOutline,
      trendingUpOutline,
      businessOutline,
      textOutline,
    });
  }

  ngOnInit() {}

  selectType(t: AccountTypeOption) {
    this.type = t.value;
    this.color = t.color;
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async save() {
    if (!this.name.trim()) return;

    await this.accountService.addAccount({
      name: this.name.trim(),
      type: this.type,
      balance: this.balance || 0,
      color: this.color,
      icon: this.selectedType.icon,
    });

    this.dismiss();
  }
}
