import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Budget } from '../models/budget.model';
import { TransactionService } from './transaction.service';
import { StorageService } from './storage.service';

export interface BudgetStatus {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'normal' | 'warning' | 'exceeded';
}

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private budgetsSubject = new BehaviorSubject<Budget[]>([]);
  public budgets$ = this.budgetsSubject.asObservable();
  private readonly STORAGE_KEY = 'budgets';

  constructor(
    private storageService: StorageService,
    private transactionService: TransactionService,
  ) {
    this.loadBudgets();
  }

  private async loadBudgets() {
    const stored = await this.storageService.get(this.STORAGE_KEY);
    if (stored) {
      this.budgetsSubject.next(stored);
    }
  }

  async addBudget(budget: Omit<Budget, 'id'>) {
    const newBudget = { ...budget, id: crypto.randomUUID() };
    const current = this.budgetsSubject.value;
    const updated = [...current, newBudget];
    await this.updateBudgets(updated);
  }

  async updateBudget(budget: Budget) {
    const current = this.budgetsSubject.value;
    const index = current.findIndex((b) => b.id === budget.id);
    if (index > -1) {
      const updated = [...current];
      updated[index] = budget;
      await this.updateBudgets(updated);
    }
  }

  async deleteBudget(id: string) {
    const current = this.budgetsSubject.value;
    const updated = current.filter((b) => b.id !== id);
    await this.updateBudgets(updated);
  }

  private async updateBudgets(budgets: Budget[]) {
    await this.storageService.set(this.STORAGE_KEY, budgets);
    this.budgetsSubject.next(budgets);
  }

  getBudgetStatus(month: string): Observable<BudgetStatus[]> {
    return combineLatest([
      this.budgets$,
      this.transactionService.transactions$,
    ]).pipe(
      map(([budgets, transactions]) => {
        // Filter budgets active for this month (global or specific)
        return budgets
          .filter((b) => !b.month || b.month === month)
          .map((budget) => {
            const categoryTransactions = transactions.filter(
              (t) =>
                t.categoryId === budget.categoryId &&
                t.type === 'expense' &&
                t.date.startsWith(month),
            );

            const spent = categoryTransactions.reduce(
              (acc, t) => acc + t.amount,
              0,
            );
            const remaining = budget.amount - spent;
            const percentage = (spent / budget.amount) * 100;
            let status: 'normal' | 'warning' | 'exceeded' = 'normal';

            if (percentage >= 100) status = 'exceeded';
            else if (percentage >= 80) status = 'warning';

            return {
              budget,
              spent,
              remaining,
              percentage,
              status,
            };
          });
      }),
    );
  }
}
