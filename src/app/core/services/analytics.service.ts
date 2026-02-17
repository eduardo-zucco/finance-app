import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { TransactionService } from './transaction.service';
import { CategoryService } from './category.service';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService,
  ) {}

  getCategoryDistribution(
    month: string,
  ): Observable<{ label: string; data: number; color: string }[]> {
    return combineLatest([
      this.transactionService.transactions$,
      this.categoryService.categories$,
    ]).pipe(
      map(([transactions, categories]) => {
        const expenseTransactions = transactions.filter(
          (t) => t.type === 'expense' && t.date.startsWith(month),
        );

        const distribution = new Map<string, number>();
        expenseTransactions.forEach((t) => {
          const current = distribution.get(t.categoryId) || 0;
          distribution.set(t.categoryId, current + t.amount);
        });

        return Array.from(distribution.entries())
          .map(([catId, amount]) => {
            const cat = categories.find((c) => c.id === catId);
            return {
              label: cat?.name || 'Unknown',
              data: amount,
              color: cat?.color || '#cccccc',
            };
          })
          .sort((a, b) => b.data - a.data);
      }),
    );
  }

  getMonthlyEvolution(
    year: string,
  ): Observable<{ labels: string[]; income: number[]; expense: number[] }> {
    return this.transactionService.transactions$.pipe(
      map((transactions) => {
        const months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        const incomeData = new Array(12).fill(0);
        const expenseData = new Array(12).fill(0);

        transactions
          .filter((t) => t.date.startsWith(year))
          .forEach((t) => {
            const monthIndex = new Date(t.date).getMonth();
            if (t.type === 'income') {
              incomeData[monthIndex] += t.amount;
            } else if (t.type === 'expense') {
              expenseData[monthIndex] += t.amount;
            }
          });

        return {
          labels: months,
          income: incomeData,
          expense: expenseData,
        };
      }),
    );
  }
}
