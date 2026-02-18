import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';
import { StorageService } from './storage.service';
import { AccountService } from './account.service';

export interface DayGroup {
  date: string;
  total: number;
  transactions: Transaction[];
}

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
      // Ordena por data de criação como secundário para manter consistência
      this.transactionsSubject.next(stored);
    }
  }

  // --- LEITURA ---

  getTransactionsGroupedByDate(): Observable<DayGroup[]> {
    return this.transactions$.pipe(
      map((transactions) => {
        const groups: { [key: string]: Transaction[] } = {};
        
        // Ordena: Mais recente primeiro
        const sorted = [...transactions].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        sorted.forEach((t) => {
          const dateKey = t.date.split('T')[0];
          if (!groups[dateKey]) groups[dateKey] = [];
          groups[dateKey].push(t);
        });

        return Object.keys(groups).map((date) => {
          const trans = groups[date];
          // Calcula total do dia (considerando entradas e saídas)
          const total = trans.reduce((acc, curr) => {
            // Se for transferência, geralmente ignoramos no total do dia ou tratamos como neutro
            if (curr.type === 'transfer') return acc;
            return curr.type === 'expense' ? acc - curr.amount : acc + curr.amount;
          }, 0);

          return { date, transactions: trans, total };
        });
      })
    );
  }

  getRecentTransactions(limit: number = 5): Observable<Transaction[]> {
    return this.transactions$.pipe(
      map(ts => [...ts]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit)
      )
    );
  }

  // --- ESCRITA ---

  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>) {
    const newTransaction: Transaction = { 
      ...transaction, 
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };

    const current = this.transactionsSubject.value;
    const updated = [newTransaction, ...current];

    // Atualiza saldo APENAS se estiver pago
    if (newTransaction.isPaid) {
      await this.updateAccountBalance(newTransaction, false);
    }

    await this.updateTransactions(updated);
  }

  async deleteTransaction(id: string) {
    const current = this.transactionsSubject.value;
    const transaction = current.find((t) => t.id === id);

    if (transaction) {
      // Se estava pago, reverte o saldo ao deletar
      if (transaction.isPaid) {
        await this.updateAccountBalance(transaction, true); // true = reverter
      }

      const updated = current.filter((t) => t.id !== id);
      await this.updateTransactions(updated);
    }
  }

  private async updateTransactions(transactions: Transaction[]) {
    await this.storageService.set(this.STORAGE_KEY, transactions);
    this.transactionsSubject.next(transactions);
  }

  private async updateAccountBalance(transaction: Transaction, revert: boolean) {
    const amount = transaction.amount;
    const multiplier = revert ? -1 : 1; // Se reverter, inverte o sinal matemático

    if (transaction.type === 'income') {
      // Receita: Soma (ou subtrai se reverter)
      await this.accountService.updateBalance(transaction.accountId, amount * multiplier);
    } 
    else if (transaction.type === 'expense') {
      // Despesa: Subtrai (ou soma se reverter)
      await this.accountService.updateBalance(transaction.accountId, -amount * multiplier);
    } 
    else if (transaction.type === 'transfer' && transaction.destinationAccountId) {
      // Transferência: Sai de A, entra em B
      await this.accountService.updateBalance(transaction.accountId, -amount * multiplier);
      await this.accountService.updateBalance(transaction.destinationAccountId, amount * multiplier);
    }
  }
}