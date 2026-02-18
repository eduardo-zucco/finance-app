import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { GoalService } from '../../core/services/goal.service';
import { Goal } from '../../core/models/goal.model';
import { Observable } from 'rxjs';
import { AddGoalModalComponent } from './components/add-goal-modal.component';
import { addIcons } from 'ionicons';
import {
  addOutline,
  trophyOutline,
  flagOutline,
  add,
  checkmarkCircleOutline,
  addCircleOutline,
  trashOutline,
  calendarOutline,
  chevronForwardOutline,
  timeOutline,
} from 'ionicons/icons';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, PageHeaderComponent],
  template: `
    <app-page-header title="Metas">
      <div slot="end">
        <ion-button fill="clear" color="medium" (click)="openAddModal()">
          <ion-icon name="add" slot="icon-only"></ion-icon>
        </ion-button>
      </div>
    </app-page-header>

    <ion-content [fullscreen]="true">
      <div class="goals-root">
        <!-- Coluna principal -->
        <div class="goals-main">
          <ng-container *ngIf="goals$ | async as goals">
            <!-- Vazio -->
            <div *ngIf="goals.length === 0" class="empty-state">
              <div class="empty-emoji">🎯</div>
              <h3>Nenhuma meta ainda</h3>
              <p>Defina objetivos financeiros e acompanhe seu progresso</p>
              <ion-button
                (click)="openAddModal()"
                color="primary"
                shape="round"
              >
                <ion-icon name="add" slot="start"></ion-icon>
                Criar primeira meta
              </ion-button>
            </div>

            <!-- Resumo geral -->
            <div *ngIf="goals.length > 0" class="summary-banner">
              <div class="sb-stat">
                <span class="sb-val">{{ getActiveCount(goals) }}</span>
                <span class="sb-lbl">Em andamento</span>
              </div>
              <div class="sb-divider"></div>
              <div class="sb-stat">
                <span class="sb-val green">{{ getCompletedCount(goals) }}</span>
                <span class="sb-lbl">Concluídas</span>
              </div>
              <div class="sb-divider"></div>
              <div class="sb-stat">
                <span class="sb-val yellow">{{
                  getTotalSaved(goals) | currency: 'BRL'
                }}</span>
                <span class="sb-lbl">Total guardado</span>
              </div>
            </div>

            <!-- Cards de metas -->
            <div
              *ngFor="let goal of goals"
              class="goal-card"
              [class.completed]="goal.status === 'completed'"
            >
              <!-- Header -->
              <div class="goal-header">
                <span class="goal-emoji">{{ goal.icon || '🎯' }}</span>
                <div class="goal-title-col">
                  <h3 class="goal-name">{{ goal.name }}</h3>
                  <div class="goal-meta">
                    <span *ngIf="goal.deadline" class="goal-deadline">
                      <ion-icon name="calendar-outline"></ion-icon>
                      {{ goal.deadline | date: 'dd MMM yyyy' : '' : 'pt-BR' }}
                    </span>
                    <span *ngIf="!goal.deadline" class="goal-deadline muted"
                      >Sem prazo</span
                    >
                  </div>
                </div>
                <div class="goal-badges">
                  <span
                    class="goal-pct-badge"
                    [class.done]="goal.status === 'completed'"
                  >
                    {{ getPct(goal) }}%
                  </span>
                  <button class="goal-menu-btn" (click)="confirmDelete(goal)">
                    <ion-icon name="trash-outline"></ion-icon>
                  </button>
                </div>
              </div>

              <!-- Barra de progresso -->
              <div class="goal-track">
                <div
                  class="goal-fill"
                  [style.width]="getPct(goal) + '%'"
                  [class.done-fill]="goal.status === 'completed'"
                ></div>
              </div>

              <!-- Valores -->
              <div class="goal-values">
                <div class="gv-col">
                  <span class="gv-label">Guardado</span>
                  <span class="gv-amount saved">{{
                    goal.currentAmount | currency: 'BRL'
                  }}</span>
                </div>
                <div class="gv-col center">
                  <span class="gv-label">Faltam</span>
                  <span class="gv-amount remaining">
                    {{
                      getRemaining(goal) > 0
                        ? (getRemaining(goal) | currency: 'BRL')
                        : '✓ Concluído'
                    }}
                  </span>
                </div>
                <div class="gv-col right">
                  <span class="gv-label">Meta</span>
                  <span class="gv-amount target">{{
                    goal.targetAmount | currency: 'BRL'
                  }}</span>
                </div>
              </div>

              <!-- Meses e sugestão mensal (se tiver prazo) -->
              <div
                *ngIf="
                  goal.deadline &&
                  goal.status === 'active' &&
                  getMonthsLeft(goal) > 0
                "
                class="goal-suggestion"
              >
                <ion-icon name="time-outline"></ion-icon>
                {{ getMonthsLeft(goal) }} meses restantes · Poupe
                <strong
                  >{{ getMonthlyTarget(goal) | currency: 'BRL' }}/mês</strong
                >
                para atingir
              </div>

              <!-- Badge concluído -->
              <div
                *ngIf="goal.status === 'completed'"
                class="goal-completed-badge"
              >
                <ion-icon name="checkmark-circle-outline"></ion-icon>
                Meta concluída! 🎉
              </div>

              <!-- Botão contribuir -->
              <div *ngIf="goal.status === 'active'" class="goal-actions">
                <button class="contribute-btn" (click)="openContribute(goal)">
                  <ion-icon name="add-circle-outline"></ion-icon>
                  Adicionar valor
                </button>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- Sidebar desktop -->
        <aside class="goals-sidebar">
          <ng-container *ngIf="goals$ | async as goals">
            <div *ngIf="goals.length > 0">
              <div class="sidebar-card">
                <p class="sidebar-title">Progresso geral</p>
                <div *ngFor="let goal of goals" class="sidebar-goal-row">
                  <div class="sgr-top">
                    <span class="sgr-emoji">{{ goal.icon || '🎯' }}</span>
                    <span class="sgr-name">{{ goal.name }}</span>
                    <span
                      class="sgr-pct"
                      [class.done]="goal.status === 'completed'"
                      >{{ getPct(goal) }}%</span
                    >
                  </div>
                  <div class="sgr-track">
                    <div
                      class="sgr-fill"
                      [style.width]="getPct(goal) + '%'"
                      [class.done-fill]="goal.status === 'completed'"
                    ></div>
                  </div>
                </div>
              </div>

              <div class="sidebar-card">
                <p class="sidebar-title">Resumo</p>
                <div class="summary-stats">
                  <div class="ss-row">
                    <span class="ss-lbl">Total investido</span>
                    <span class="ss-val">{{
                      getTotalSaved(goals) | currency: 'BRL'
                    }}</span>
                  </div>
                  <div class="ss-row">
                    <span class="ss-lbl">Total necessário</span>
                    <span class="ss-val muted">{{
                      getTotalTarget(goals) | currency: 'BRL'
                    }}</span>
                  </div>
                  <div class="ss-divider"></div>
                  <div class="ss-row">
                    <span class="ss-lbl bold">% global</span>
                    <span class="ss-val bold green"
                      >{{ getGlobalPct(goals) }}%</span
                    >
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
              Nova meta
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

      <!-- Inline contribute sheet -->
      <div
        class="contribute-sheet"
        *ngIf="contributingGoal"
        (click)="closeContribute()"
      >
        <div class="contribute-content" (click)="$event.stopPropagation()">
          <div class="cs-header">
            <span
              >{{ contributingGoal.icon || '🎯' }} Adicionar para
              {{ contributingGoal.name }}</span
            >
            <button class="cs-close" (click)="closeContribute()">✕</button>
          </div>
          <div class="cs-input-row">
            <span class="cs-prefix">R$</span>
            <input
              type="number"
              [(ngModel)]="contributionAmount"
              placeholder="0,00"
              inputmode="decimal"
              class="cs-input"
              autofocus
            />
          </div>
          <ion-button
            expand="block"
            (click)="saveContribution()"
            [disabled]="!contributionAmount || contributionAmount <= 0"
            color="primary"
            shape="round"
            class="cs-btn"
          >
            Confirmar
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      ion-content {
        --background: #111827;
      }

      /* ── Layout ── */
      .goals-root {
        display: flex;
        gap: 24px;
        max-width: 1100px;
        margin: 0 auto;
        padding: 20px 16px 100px;
        align-items: flex-start;
      }

      .goals-main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .goals-sidebar {
        display: none;
        width: 260px;
        flex-shrink: 0;
        position: sticky;
        top: 20px;
        flex-direction: column;
        gap: 16px;
      }

      @media (min-width: 900px) {
        .goals-sidebar {
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
      .empty-emoji {
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

      /* ── Summary banner ── */
      .summary-banner {
        background: #1f2937;
        border: 1px solid #2d3748;
        border-radius: 18px;
        padding: 18px 20px;
        display: flex;
        align-items: center;
        justify-content: space-around;
      }

      .sb-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .sb-val {
        font-size: 20px;
        font-weight: 900;
        color: #f9fafb;
      }
      .sb-val.green {
        color: #34d399;
      }
      .sb-val.yellow {
        color: #fbbf24;
        font-size: 15px;
      }
      .sb-lbl {
        font-size: 11px;
        color: #6b7280;
        font-weight: 500;
      }
      .sb-divider {
        width: 1px;
        height: 36px;
        background: #374151;
      }

      /* ── Goal cards ── */
      .goal-card {
        background: #1f2937;
        border: 1px solid #2d3748;
        border-radius: 20px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        transition: border-color 0.2s;
      }

      .goal-card.completed {
        border-color: rgba(52, 211, 153, 0.3);
        opacity: 0.8;
      }

      /* Header */
      .goal-header {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .goal-emoji {
        font-size: 32px;
        flex-shrink: 0;
      }

      .goal-title-col {
        flex: 1;
        min-width: 0;
      }
      .goal-name {
        font-size: 16px;
        font-weight: 700;
        color: #f9fafb;
        margin: 0 0 5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .goal-meta {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .goal-deadline {
        font-size: 12px;
        color: #6b7280;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .goal-deadline.muted {
        color: #374151;
      }
      .goal-deadline ion-icon {
        font-size: 12px;
      }

      .goal-badges {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }

      .goal-pct-badge {
        font-size: 12px;
        font-weight: 800;
        padding: 3px 10px;
        border-radius: 20px;
        background: #1e3a5f;
        color: #60a5fa;
      }
      .goal-pct-badge.done {
        background: rgba(52, 211, 153, 0.15);
        color: #34d399;
      }

      .goal-menu-btn {
        background: none;
        border: none;
        padding: 6px;
        border-radius: 8px;
        color: #4b5563;
        cursor: pointer;
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
        opacity: 0;
      }
      .goal-card:hover .goal-menu-btn {
        opacity: 1;
      }
      .goal-menu-btn:hover {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
      }

      @media (max-width: 768px) {
        .goal-menu-btn {
          opacity: 0.4;
        }
      }

      /* Track */
      .goal-track {
        height: 8px;
        background: #374151;
        border-radius: 99px;
        overflow: hidden;
      }

      .goal-fill {
        height: 100%;
        border-radius: 99px;
        background: linear-gradient(90deg, #6366f1, #818cf8);
        transition: width 0.8s ease;
        max-width: 100%;
      }
      .goal-fill.done-fill {
        background: linear-gradient(90deg, #34d399, #10b981);
      }

      /* Values */
      .goal-values {
        display: flex;
        justify-content: space-between;
      }
      .gv-col {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .gv-col.center {
        align-items: center;
      }
      .gv-col.right {
        align-items: flex-end;
      }
      .gv-label {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #4b5563;
      }
      .gv-amount {
        font-size: 14px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }
      .gv-amount.saved {
        color: #818cf8;
      }
      .gv-amount.remaining {
        color: #f9fafb;
      }
      .gv-amount.target {
        color: #4b5563;
      }

      /* Suggestion */
      .goal-suggestion {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #6b7280;
        background: #111827;
        padding: 10px 14px;
        border-radius: 12px;
      }
      .goal-suggestion ion-icon {
        font-size: 13px;
        color: #fbbf24;
        flex-shrink: 0;
      }
      .goal-suggestion strong {
        color: #fbbf24;
      }

      /* Completed */
      .goal-completed-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 700;
        color: #34d399;
        background: rgba(52, 211, 153, 0.1);
        padding: 10px 14px;
        border-radius: 12px;
      }
      .goal-completed-badge ion-icon {
        font-size: 16px;
      }

      /* Contribute btn */
      .goal-actions {
        display: flex;
        justify-content: flex-end;
      }
      .contribute-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(99, 102, 241, 0.12);
        border: 1px solid rgba(99, 102, 241, 0.25);
        border-radius: 12px;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 700;
        color: #818cf8;
        cursor: pointer;
        transition: all 0.15s;
      }
      .contribute-btn:hover {
        background: rgba(99, 102, 241, 0.2);
      }
      .contribute-btn ion-icon {
        font-size: 16px;
      }

      /* ── Contribute sheet (inline overlay) ── */
      .contribute-sheet {
        position: fixed;
        inset: 0;
        z-index: 999;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .contribute-content {
        background: #1f2937;
        border: 1px solid #374151;
        border-radius: 24px 24px 0 0;
        padding: 24px 20px calc(24px + env(safe-area-inset-bottom));
        width: 100%;
        max-width: 480px;
        animation: slideUp 0.25s ease;
      }

      @keyframes slideUp {
        from {
          transform: translateY(40px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .cs-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        font-weight: 700;
        color: #e5e7eb;
        margin-bottom: 20px;
      }
      .cs-close {
        background: #374151;
        border: none;
        color: #9ca3af;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .cs-input-row {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #111827;
        border: 1px solid #374151;
        border-radius: 14px;
        padding: 14px 18px;
        margin-bottom: 16px;
      }
      .cs-prefix {
        font-size: 18px;
        color: #6b7280;
        font-weight: 700;
      }
      .cs-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        font-size: 32px;
        font-weight: 900;
        color: #f9fafb;
      }
      .cs-input::placeholder {
        color: #374151;
      }
      .cs-input::-webkit-inner-spin-button,
      .cs-input::-webkit-outer-spin-button {
        -webkit-appearance: none;
      }
      .cs-btn {
        --border-radius: 99px;
        height: 52px;
        font-size: 15px;
        font-weight: 700;
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

      .sidebar-goal-row {
        padding: 8px 0;
        border-bottom: 1px solid #2d3748;
      }
      .sidebar-goal-row:last-child {
        border-bottom: none;
      }
      .sgr-top {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }
      .sgr-emoji {
        font-size: 16px;
      }
      .sgr-name {
        flex: 1;
        font-size: 13px;
        font-weight: 600;
        color: #d1d5db;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .sgr-pct {
        font-size: 12px;
        font-weight: 700;
        color: #818cf8;
        flex-shrink: 0;
      }
      .sgr-pct.done {
        color: #34d399;
      }

      .sgr-track {
        height: 5px;
        background: #374151;
        border-radius: 99px;
        overflow: hidden;
      }
      .sgr-fill {
        height: 100%;
        border-radius: 99px;
        background: #6366f1;
      }
      .sgr-fill.done-fill {
        background: #34d399;
      }

      .summary-stats {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .ss-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .ss-lbl {
        font-size: 13px;
        color: #6b7280;
      }
      .ss-lbl.bold {
        font-weight: 700;
        color: #d1d5db;
      }
      .ss-val {
        font-size: 14px;
        font-weight: 700;
        color: #e5e7eb;
        font-variant-numeric: tabular-nums;
      }
      .ss-val.muted {
        color: #6b7280;
      }
      .ss-val.green {
        color: #34d399;
      }
      .ss-val.bold {
        font-size: 18px;
        font-weight: 900;
      }
      .ss-divider {
        height: 1px;
        background: #2d3748;
        margin: 4px 0;
      }
    `,
  ],
})
export class GoalsPage implements OnInit {
  goals$: Observable<Goal[]>;
  contributingGoal: Goal | null = null;
  contributionAmount: number | null = null;

  constructor(
    private goalService: GoalService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
  ) {
    addIcons({
      addOutline,
      trophyOutline,
      flagOutline,
      add,
      checkmarkCircleOutline,
      addCircleOutline,
      trashOutline,
      calendarOutline,
      chevronForwardOutline,
      timeOutline,
    });
    this.goals$ = this.goalService.goals$;
  }

  ngOnInit() {}

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: AddGoalModalComponent,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      handle: true,
      cssClass: 'transaction-modal',
    });
    await modal.present();
  }

  async confirmDelete(goal: Goal) {
    const alert = await this.alertCtrl.create({
      header: `Excluir "${goal.name}"?`,
      message: 'Esta ação não pode ser desfeita.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => this.goalService.deleteGoal(goal.id),
        },
      ],
    });
    await alert.present();
  }

  openContribute(goal: Goal) {
    this.contributingGoal = goal;
    this.contributionAmount = null;
  }

  closeContribute() {
    this.contributingGoal = null;
    this.contributionAmount = null;
  }

  async saveContribution() {
    if (
      !this.contributingGoal ||
      !this.contributionAmount ||
      this.contributionAmount <= 0
    )
      return;

    const updated: Goal = {
      ...this.contributingGoal,
      currentAmount:
        this.contributingGoal.currentAmount + this.contributionAmount,
      status:
        this.contributingGoal.currentAmount + this.contributionAmount >=
        this.contributingGoal.targetAmount
          ? 'completed'
          : 'active',
    };

    await this.goalService.updateGoal(updated);
    this.closeContribute();
  }

  getPct(goal: Goal): number {
    if (!goal.targetAmount || goal.targetAmount <= 0) return 0;
    return Math.min(
      Math.round((goal.currentAmount / goal.targetAmount) * 100),
      100,
    );
  }

  getRemaining(goal: Goal): number {
    return Math.max(goal.targetAmount - goal.currentAmount, 0);
  }

  getMonthsLeft(goal: Goal): number {
    if (!goal.deadline) return 0;
    const deadline = new Date(goal.deadline);
    const now = new Date();
    const diff =
      (deadline.getFullYear() - now.getFullYear()) * 12 +
      (deadline.getMonth() - now.getMonth());
    return Math.max(diff, 0);
  }

  getMonthlyTarget(goal: Goal): number {
    const months = this.getMonthsLeft(goal);
    if (months <= 0) return 0;
    return this.getRemaining(goal) / months;
  }

  getActiveCount(goals: Goal[]): number {
    return goals.filter((g) => g.status === 'active').length;
  }

  getCompletedCount(goals: Goal[]): number {
    return goals.filter((g) => g.status === 'completed').length;
  }

  getTotalSaved(goals: Goal[]): number {
    return goals.reduce((acc, g) => acc + g.currentAmount, 0);
  }

  getTotalTarget(goals: Goal[]): number {
    return goals.reduce((acc, g) => acc + g.targetAmount, 0);
  }

  getGlobalPct(goals: Goal[]): number {
    const target = this.getTotalTarget(goals);
    if (target <= 0) return 0;
    return Math.min(
      Math.round((this.getTotalSaved(goals) / target) * 100),
      100,
    );
  }
}
