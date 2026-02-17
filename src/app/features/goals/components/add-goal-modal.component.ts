import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { GoalService } from '../../../core/services/goal.service';
import { addIcons } from 'ionicons';
import { closeOutline, checkmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-add-goal-modal',
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
        <ion-title>New Goal</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="save()" [disabled]="!name || !targetAmount">
            <ion-icon name="checkmark-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-label position="stacked">Goal Name</ion-label>
          <ion-input [(ngModel)]="name" placeholder="E.g. New Car"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Target Amount</ion-label>
          <ion-input
            type="number"
            [(ngModel)]="targetAmount"
            placeholder="0.00"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Initial Saved Amount</ion-label>
          <ion-input
            type="number"
            [(ngModel)]="currentAmount"
            placeholder="0.00"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Deadline (Optional)</ion-label>
          <ion-datetime-button datetime="goalDeadline"></ion-datetime-button>
          <ion-modal [keepContentsMounted]="true">
            <ng-template>
              <ion-datetime
                id="goalDeadline"
                presentation="date"
                [(ngModel)]="deadline"
              ></ion-datetime>
            </ng-template>
          </ion-modal>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
})
export class AddGoalModalComponent implements OnInit {
  name: string = '';
  targetAmount: number | null = null;
  currentAmount: number = 0;
  deadline: string = '';

  constructor(
    private modalCtrl: ModalController,
    private goalService: GoalService,
  ) {
    addIcons({ closeOutline, checkmarkOutline });
  }

  ngOnInit() {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async save() {
    if (!this.name || !this.targetAmount) return;

    await this.goalService.addGoal({
      name: this.name,
      targetAmount: this.targetAmount,
      currentAmount: this.currentAmount || 0,
      deadline: this.deadline || undefined,
      status: 'active',
    });

    this.dismiss();
  }
}
