import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, from } from 'rxjs';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private _storage: Storage | null = null;
  private _transactions = new BehaviorSubject<Transaction[]>([]);

  public transactions$ = this._transactions.asObservable();

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
    this.loadTransactions();
  }

  async loadTransactions() {
    const stored = await this._storage?.get('transactions');
    if (stored) {
      this._transactions.next(stored);
    }
  }

  async addTransaction(transaction: Transaction) {
    const current = this._transactions.value;
    const updated = [transaction, ...current];
    await this._storage?.set('transactions', updated);
    this._transactions.next(updated);
  }

  async deleteTransaction(id: string) {
    const current = this._transactions.value;
    const updated = current.filter(t => t.id !== id);
    await this._storage?.set('transactions', updated);
    this._transactions.next(updated);
  }
}