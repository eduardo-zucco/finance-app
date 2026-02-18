import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { GoalService } from '../../../core/services/goal.service';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  checkmarkOutline,
  trophyOutline,
  calendarOutline,
  cashOutline,
  textOutline,
  flagOutline,
  rocketOutline,
  homeOutline,
  carOutline,
  schoolOutline,
  heartOutline,
} from 'ionicons/icons';

interface GoalEmoji {
  emoji: string;
  label: string;
}

@Component({
  selector: 'app-add-goal-modal',
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
        <ion-title class="modal-title">Nova Meta</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [scrollY]="true">
      <!-- Hero: emoji + progresso preview -->
      <div class="goal-hero">
        <div class="hero-bg-orb"></div>

        <!-- Seletor de emoji -->
        <div class="emoji-row">
          <button
            *ngFor="let e of emojiOptions"
            class="emoji-btn"
            [class.active]="selectedEmoji === e.emoji"
            (click)="selectedEmoji = e.emoji"
            [title]="e.label"
          >
            {{ e.emoji }}
          </button>
        </div>

        <!-- Preview -->
        <div class="hero-preview">
          <span class="hero-emoji">{{ selectedEmoji }}</span>
          <div class="hero-info">
            <p class="hero-name">{{ name || 'Nome da meta' }}</p>
            <p class="hero-pct">
              {{
                targetAmount
                  ? getInitialPct() + '% concluído'
                  : 'Defina um valor alvo'
              }}
            </p>
          </div>
        </div>

        <!-- Mini barra de progresso -->
        <div class="hero-track" *ngIf="targetAmount && targetAmount > 0">
          <div class="hero-fill" [style.width]="getInitialPct() + '%'"></div>
        </div>
      </div>

      <!-- Campos -->
      <div class="fields-wrap">
        <!-- Nome -->
        <div class="field-row">
          <div class="field-icon" style="background:#fef3c7">
            <ion-icon name="text-outline" style="color:#d97706"></ion-icon>
          </div>
          <div class="field-body">
            <p class="field-label">Nome da meta</p>
            <input
              type="text"
              [(ngModel)]="name"
              placeholder="Ex: Viagem, Carro, Reserva..."
              class="field-input"
            />
          </div>
        </div>

        <!-- Valor alvo -->
        <div class="field-row">
          <div class="field-icon" style="background:#d1fae5">
            <ion-icon name="trophy-outline" style="color:#059669"></ion-icon>
          </div>
          <div class="field-body">
            <p class="field-label">Valor alvo</p>
            <div class="amount-row">
              <span class="amount-prefix">R$</span>
              <input
                type="number"
                [(ngModel)]="targetAmount"
                placeholder="0,00"
                inputmode="decimal"
                class="field-input amount-input"
              />
            </div>
          </div>
        </div>

        <!-- Já guardei -->
        <div class="field-row">
          <div class="field-icon" style="background:#dbeafe">
            <ion-icon name="cash-outline" style="color:#2563eb"></ion-icon>
          </div>
          <div class="field-body">
            <p class="field-label">Já tenho guardado</p>
            <div class="amount-row">
              <span class="amount-prefix">R$</span>
              <input
                type="number"
                [(ngModel)]="currentAmount"
                placeholder="0,00"
                inputmode="decimal"
                class="field-input amount-input"
              />
            </div>
          </div>
        </div>

        <!-- Prazo -->
        <div class="field-row last">
          <div class="field-icon" style="background:#ede9fe">
            <ion-icon name="calendar-outline" style="color:#7c3aed"></ion-icon>
          </div>
          <div class="field-body">
            <p class="field-label">Prazo (opcional)</p>
            <input
              type="date"
              [(ngModel)]="deadlineInput"
              class="field-input date-input"
            />
          </div>
        </div>
      </div>

      <!-- Preview card (quando válido) -->
      <div class="preview-card" *ngIf="isValid()">
        <div class="preview-row">
          <span class="preview-lbl">Falta guardar</span>
          <span class="preview-val green">{{
            getRemainingAmount() | currency: 'BRL'
          }}</span>
        </div>
        <div class="preview-row" *ngIf="deadlineInput">
          <span class="preview-lbl">Meses restantes</span>
          <span class="preview-val">{{ getMonthsLeft() }} meses</span>
        </div>
        <div class="preview-row" *ngIf="deadlineInput && getMonthsLeft() > 0">
          <span class="preview-lbl">Poupar por mês</span>
          <span class="preview-val yellow">{{
            getMonthlyTarget() | currency: 'BRL'
          }}</span>
        </div>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border">
      <div class="footer-wrap">
        <ion-button
          expand="block"
          (click)="save()"
          [disabled]="!isValid()"
          color="primary"
          shape="round"
          class="save-btn"
        >
          <ion-icon name="checkmark-outline" slot="start"></ion-icon>
          {{ isValid() ? 'Criar meta' : 'Preencha os campos' }}
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

      /* ── Hero ── */
      .goal-hero {
        background: linear-gradient(
          135deg,
          #0f172a 0%,
          #1e1b4b 60%,
          #312e81 100%
        );
        padding: 20px 20px 24px;
        position: relative;
        overflow: hidden;
      }

      .hero-bg-orb {
        position: absolute;
        width: 200px;
        height: 200px;
        background: rgba(99, 102, 241, 0.2);
        border-radius: 50%;
        filter: blur(50px);
        top: -60px;
        right: -40px;
        pointer-events: none;
      }

      /* Emoji picker */
      .emoji-row {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }

      .emoji-btn {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        border: 1.5px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.06);
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
      }

      .emoji-btn.active {
        border-color: #818cf8;
        background: rgba(129, 140, 248, 0.2);
        transform: scale(1.12);
      }

      /* Preview */
      .hero-preview {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 14px;
        position: relative;
        z-index: 1;
      }

      .hero-emoji {
        font-size: 38px;
        flex-shrink: 0;
      }

      .hero-name {
        font-size: 18px;
        font-weight: 800;
        color: #f9fafb;
        margin: 0 0 4px;
      }

      .hero-pct {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.45);
        margin: 0;
        font-weight: 500;
      }

      .hero-track {
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 99px;
        overflow: hidden;
        position: relative;
        z-index: 1;
      }

      .hero-fill {
        height: 100%;
        background: linear-gradient(90deg, #818cf8, #6366f1);
        border-radius: 99px;
        transition: width 0.5s ease;
        max-width: 100%;
      }

      /* ── Fields ── */
      .fields-wrap {
        background: #1f2937;
        border: 1px solid #2d3748;
        border-radius: 20px;
        margin: 14px 16px 12px;
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
      .field-row:last-child,
      .field-row.last {
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

      .date-input {
        color-scheme: dark;
      }
      .date-input::-webkit-calendar-picker-indicator {
        filter: invert(0.4);
        cursor: pointer;
      }

      .amount-row {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .amount-prefix {
        font-size: 13px;
        color: #6b7280;
        font-weight: 600;
      }
      .amount-input {
        flex: 1;
      }

      /* ── Preview card ── */
      .preview-card {
        background: #1f2937;
        border: 1px solid #2d3748;
        border-radius: 16px;
        margin: 0 16px 16px;
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .preview-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .preview-lbl {
        font-size: 13px;
        color: #6b7280;
        font-weight: 500;
      }

      .preview-val {
        font-size: 14px;
        font-weight: 700;
        color: #e5e7eb;
        font-variant-numeric: tabular-nums;
      }
      .preview-val.green {
        color: #34d399;
      }
      .preview-val.yellow {
        color: #fbbf24;
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
export class AddGoalModalComponent implements OnInit {
  name: string = '';
  targetAmount: number | null = null;
  currentAmount: number = 0;
  deadlineInput: string = '';
  selectedEmoji: string = '🎯';

  emojiOptions: GoalEmoji[] = [
    { emoji: '🎯', label: 'Meta' },
    { emoji: '🏠', label: 'Casa' },
    { emoji: '🚗', label: 'Carro' },
    { emoji: '✈️', label: 'Viagem' },
    { emoji: '📚', label: 'Educação' },
    { emoji: '💍', label: 'Casamento' },
    { emoji: '🏖️', label: 'Férias' },
    { emoji: '💻', label: 'Tecnologia' },
    { emoji: '🏋️', label: 'Saúde' },
    { emoji: '🎮', label: 'Lazer' },
  ];

  constructor(
    private modalCtrl: ModalController,
    private goalService: GoalService,
  ) {
    addIcons({
      closeOutline,
      checkmarkOutline,
      trophyOutline,
      calendarOutline,
      cashOutline,
      textOutline,
      flagOutline,
      rocketOutline,
      homeOutline,
      carOutline,
      schoolOutline,
      heartOutline,
    });
  }

  ngOnInit() {}

  isValid(): boolean {
    return !!this.name.trim() && !!this.targetAmount && this.targetAmount > 0;
  }

  getInitialPct(): number {
    if (!this.targetAmount || this.targetAmount <= 0) return 0;
    return Math.min(
      Math.round(((this.currentAmount || 0) / this.targetAmount) * 100),
      100,
    );
  }

  getRemainingAmount(): number {
    return Math.max((this.targetAmount ?? 0) - (this.currentAmount || 0), 0);
  }

  getMonthsLeft(): number {
    if (!this.deadlineInput) return 0;
    const deadline = new Date(this.deadlineInput + 'T12:00:00');
    const now = new Date();
    const diff =
      (deadline.getFullYear() - now.getFullYear()) * 12 +
      (deadline.getMonth() - now.getMonth());
    return Math.max(diff, 0);
  }

  getMonthlyTarget(): number {
    const months = this.getMonthsLeft();
    if (months <= 0) return 0;
    return this.getRemainingAmount() / months;
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async save() {
    if (!this.isValid()) return;

    await this.goalService.addGoal({
      name: this.name.trim(),
      targetAmount: this.targetAmount!,
      currentAmount: this.currentAmount || 0,
      deadline: this.deadlineInput
        ? new Date(this.deadlineInput + 'T12:00:00').toISOString()
        : undefined,
      status: 'active',
      icon: this.selectedEmoji,
    });

    this.dismiss();
  }
}
