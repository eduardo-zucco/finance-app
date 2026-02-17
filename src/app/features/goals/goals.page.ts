import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { GoalService } from '../../core/services/goal.service';
import { Goal } from '../../core/models/goal.model';
import { Observable } from 'rxjs';
import { AddGoalModalComponent } from './components/add-goal-modal.component';
import { addIcons } from 'ionicons';
import { addOutline, trophyOutline, flagOutline } from 'ionicons/icons';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent],
  template: `
    <app-page-header title="Goals"></app-page-header>

    <ion-content class="ion-padding bg-gray-50 dark:bg-gray-900">
      <div class="grid grid-cols-1 gap-4">
        <ion-card
          *ngFor="let goal of goals$ | async"
          class="m-0 shadow-sm"
          [ngClass]="{ 'opacity-75': goal.status === 'completed' }"
        >
          <ion-card-content>
            <div class="flex items-center space-x-4 mb-3">
              <div class="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <ion-icon name="trophy-outline" class="text-xl"></ion-icon>
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-gray-800 dark:text-white">
                  {{ goal.name }}
                </h3>
                <p class="text-xs text-gray-500" *ngIf="goal.deadline">
                  Target: {{ goal.deadline | date: 'mediumDate' }}
                </p>
              </div>
              <div *ngIf="goal.status === 'completed'">
                <ion-badge color="success">Completed</ion-badge>
              </div>
            </div>

            <div class="mb-2">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600 dark:text-gray-300">{{
                  goal.currentAmount | currency
                }}</span>
                <span class="text-gray-400"
                  >of {{ goal.targetAmount | currency }}</span
                >
              </div>
              <ion-progress-bar
                [value]="goal.currentAmount / goal.targetAmount"
                color="primary"
              ></ion-progress-bar>
            </div>

            <div class="flex justify-end mt-2" *ngIf="goal.status === 'active'">
              <ion-button
                size="small"
                fill="clear"
                (click)="addContribution(goal)"
              >
                Add Funds
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
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
export class GoalsPage implements OnInit {
  goals$: Observable<Goal[]>;

  constructor(
    private goalService: GoalService,
    private modalCtrl: ModalController,
  ) {
    addIcons({ addOutline, trophyOutline, flagOutline });
    this.goals$ = this.goalService.goals$;
  }

  ngOnInit() {}

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: AddGoalModalComponent,
    });
    await modal.present();
  }

  async addContribution(goal: Goal) {
    // In a real app this would open a modal to input amount
    // For prototype, we'll just add a fixed amount or prompt
    // Let's keep it simple for now, just a placeholder action
    // We can add a specialized modal for this later if requested
    console.log('Add contribution to', goal.name);
  }
}
