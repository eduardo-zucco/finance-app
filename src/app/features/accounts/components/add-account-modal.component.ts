import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../../core/services/account.service';
import { AccountType } from '../../../core/models/account.model';
import { addIcons } from 'ionicons';
import { closeOutline, checkmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-add-account-modal',
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
        <ion-title>Add Account</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="save()" [disabled]="!name">
            <ion-icon name="checkmark-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-label position="stacked">Account Name</ion-label>
          <ion-input
            [(ngModel)]="name"
            placeholder="E.g. Main Wallet"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Type</ion-label>
          <ion-select [(ngModel)]="type" interface="popover">
            <ion-select-option value="cash">Cash</ion-select-option>
            <ion-select-option value="bank">Bank</ion-select-option>
            <ion-select-option value="card">Card</ion-select-option>
            <ion-select-option value="savings">Savings</ion-select-option>
            <ion-select-option value="investment">Investment</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Initial Balance</ion-label>
          <ion-input
            type="number"
            [(ngModel)]="balance"
            placeholder="0.00"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Color code</ion-label>
          <ion-input type="text" [(ngModel)]="color"></ion-input>
          <div
            slot="end"
            class="w-6 h-6 rounded-full"
            [style.background-color]="color"
          ></div>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
})
export class AddAccountModalComponent implements OnInit {
  name: string = '';
  type: AccountType = 'cash';
  balance: number = 0;
  color: string = '#3b82f6';
  icon: string = 'card-outline'; // Default icon strategy could be improved

  constructor(
    private modalCtrl: ModalController,
    private accountService: AccountService,
  ) {
    addIcons({ closeOutline, checkmarkOutline });
  }

  ngOnInit() {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async save() {
    if (!this.name) return;

    // Simple icon mapping based on type
    switch (this.type) {
      case 'cash':
        this.icon = 'cash-outline';
        break;
      case 'bank':
        this.icon = 'card-outline';
        break;
      case 'card':
        this.icon = 'card-outline';
        break;
      case 'savings':
        this.icon = 'wallet-outline';
        break;
      case 'investment':
        this.icon = 'trending-up-outline';
        break;
    }

    await this.accountService.addAccount({
      name: this.name,
      type: this.type,
      balance: this.balance || 0,
      color: this.color,
      icon: this.icon,
    });

    this.dismiss();
  }
}
