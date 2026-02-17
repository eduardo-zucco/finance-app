import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { AccountService } from '../../core/services/account.service';
import { Observable } from 'rxjs';
import { Account } from '../../core/models/account.model';
import { AddAccountModalComponent } from './components/add-account-modal.component';
import { addIcons } from 'ionicons';
import {
  addOutline,
  walletOutline,
  cardOutline,
  cashOutline,
  trendingUpOutline,
} from 'ionicons/icons';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent],
  template: `
    <app-page-header title="Accounts"></app-page-header>

    <ion-content class="ion-padding bg-gray-50 dark:bg-gray-900">
      <div class="grid grid-cols-1 gap-4">
        <ion-card
          *ngFor="let acc of accounts$ | async"
          class="m-0 shadow-sm"
          [style.border-left]="'4px solid ' + acc.color"
        >
          <ion-card-content>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                  <ion-icon
                    [name]="acc.icon"
                    class="text-2xl"
                    [style.color]="acc.color"
                  ></ion-icon>
                </div>
                <div>
                  <h3 class="font-bold text-gray-800 dark:text-white">
                    {{ acc.name }}
                  </h3>
                  <p class="text-sm text-gray-500 capitalize">{{ acc.type }}</p>
                </div>
              </div>
              <div class="text-right">
                <h3 class="font-bold text-lg text-gray-800 dark:text-white">
                  {{ acc.balance | currency }}
                </h3>
              </div>
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
export class AccountsPage implements OnInit {
  accounts$: Observable<Account[]>;

  constructor(
    private accountService: AccountService,
    private modalCtrl: ModalController,
  ) {
    addIcons({
      addOutline,
      walletOutline,
      cardOutline,
      cashOutline,
      trendingUpOutline,
    });
    this.accounts$ = this.accountService.accounts$;
  }

  ngOnInit() {}

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: AddAccountModalComponent,
    });
    await modal.present();
  }
}
