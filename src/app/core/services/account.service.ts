import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Account } from '../models/account.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private accountsSubject = new BehaviorSubject<Account[]>([]);
  public accounts$ = this.accountsSubject.asObservable();
  private readonly STORAGE_KEY = 'accounts';

  constructor(private storageService: StorageService) {
    this.loadAccounts();
  }

  private async loadAccounts() {
    const stored = await this.storageService.get(this.STORAGE_KEY);
    if (stored && stored.length > 0) {
      this.accountsSubject.next(stored);
    } else {
      await this.seedDefaultAccounts();
    }
  }

  private async seedDefaultAccounts() {
    const defaults: Account[] = [
      {
        id: crypto.randomUUID(),
        name: 'Wallet',
        type: 'cash',
        balance: 0,
        color: '#10b981',
        icon: 'wallet-outline',
      },
      {
        id: crypto.randomUUID(),
        name: 'Bank Account',
        type: 'bank',
        balance: 0,
        color: '#3b82f6',
        icon: 'card-outline',
      },
    ];
    await this.storageService.set(this.STORAGE_KEY, defaults);
    this.accountsSubject.next(defaults);
  }

  getAccounts(): Observable<Account[]> {
    return this.accounts$;
  }

  async addAccount(account: Omit<Account, 'id'>) {
    const newAccount = { ...account, id: crypto.randomUUID() };
    const current = this.accountsSubject.value;
    const updated = [...current, newAccount];
    await this.updateAccounts(updated);
  }

  async updateAccount(account: Account) {
    const current = this.accountsSubject.value;
    const index = current.findIndex((a) => a.id === account.id);
    if (index > -1) {
      const updated = [...current];
      updated[index] = account;
      await this.updateAccounts(updated);
    }
  }

  async deleteAccount(id: string) {
    const current = this.accountsSubject.value;
    const updated = current.filter((a) => a.id !== id);
    await this.updateAccounts(updated);
  }

  async updateBalance(accountId: string, amount: number) {
    const current = this.accountsSubject.value;
    const index = current.findIndex((a) => a.id === accountId);
    if (index > -1) {
      const updated = [...current];
      updated[index] = {
        ...updated[index],
        balance: updated[index].balance + amount,
      };
      await this.updateAccounts(updated);
    }
  }

  private async updateAccounts(accounts: Account[]) {
    await this.storageService.set(this.STORAGE_KEY, accounts);
    this.accountsSubject.next(accounts);
  }
}
