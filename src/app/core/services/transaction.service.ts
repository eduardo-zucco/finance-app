import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';
import { StorageService } from './storage.service';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();
  private readonly STORAGE_KEY = 'transactions';

  constructor(
    private storageService: StorageService,
    private accountService: AccountService,
  ) {
    this.loadTransactions();
  }

  private async loadTransactions() {
    const stored = await this.storageService.get(this.STORAGE_KEY);
    if (stored) {
      this.transactionsSubject.next(stored);
    }
  }

  getTransactions(): Observable<Transaction[]> {
    return this.transactions$;
  }

  async addTransaction(transaction: Omit<Transaction, 'id'>) {
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    const current = this.transactionsSubject.value;
    const updated = [newTransaction, ...current]; // Newest first

    // Update Account Balance
    await this.updateAccountBalance(newTransaction, false);

    await this.updateTransactions(updated);
  }

  async deleteTransaction(id: string) {
    const current = this.transactionsSubject.value;
    const transaction = current.find((t) => t.id === id);

    if (transaction) {
      // Revert Balance
      await this.updateAccountBalance(transaction, true); // true = revert

      const updated = current.filter((t) => t.id !== id);
      await this.updateTransactions(updated);
    }
  }

  // TODO: Implement updateTransaction (complex due to balance diff logic)

  private async updateTransactions(transactions: Transaction[]) {
    await this.storageService.set(this.STORAGE_KEY, transactions);
    this.transactionsSubject.next(transactions);
  }

  private async updateAccountBalance(
    transaction: Transaction,
    revert: boolean,
  ) {
    const amount = transaction.amount;
    const multiplier = revert ? -1 : 1;

    if (transaction.type === 'income') {
      await this.accountService.updateBalance(
        transaction.accountId,
        amount * multiplier,
      );
    } else if (transaction.type === 'expense') {
      await this.accountService.updateBalance(
        transaction.accountId,
        -amount * multiplier,
      );
    } else if (transaction.type === 'transfer' && transaction.toAccountId) {
      await this.accountService.updateBalance(
        transaction.accountId,
        -amount * multiplier,
      );
      await this.accountService.updateBalance(
        transaction.toAccountId,
        amount * multiplier,
      );
    }
  }

  getFilteredTransactions(filters: {
    categoryId?: string;
    accountId?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<Transaction[]> {
    // Logic to filter the stream primarily for display
    // For now, return all, component will filter or we add logic here
    // Implementing basic in-memory filter
    return new Observable<Transaction[]>((observer) => {
      this.transactions$.subscribe((transactions) => {
        let filtered = transactions;
        if (filters.categoryId)
          filtered = filtered.filter(
            (t) => t.categoryId === filters.categoryId,
          );
        if (filters.accountId)
          filtered = filtered.filter((t) => t.accountId === filters.accountId);
        // Date filtering logic to be added
        observer.next(filtered);
      });
    });
  }
}
