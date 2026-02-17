import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Transaction } from 'src/app/models/transaction.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-add-transaction-modal',
  templateUrl: './add-transaction-modal.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddTransactionModalComponent {
  transaction: Partial<Transaction> = {
    type: 'expense',
    date: new Date().toISOString()
  };

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    if (this.transaction.title && this.transaction.amount) {
      const newTransaction: Transaction = {
        id: uuidv4(),
        title: this.transaction.title,
        amount: this.transaction.amount,
        type: this.transaction.type || 'expense',
        category: this.transaction.category || 'Outros',
        date: this.transaction.date || new Date().toISOString()
      };
      this.modalCtrl.dismiss(newTransaction);
    }
  }
}