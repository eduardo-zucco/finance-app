import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.page').then((m) => m.LayoutPage),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.page').then(
            (m) => m.DashboardPage,
          ),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transactions.page').then(
            (m) => m.TransactionsPage,
          ),
      },
      {
        path: 'accounts',
        loadComponent: () =>
          import('./features/accounts/accounts.page').then(
            (m) => m.AccountsPage,
          ),
      },
      {
        path: 'budgets',
        loadComponent: () =>
          import('./features/budgets/budgets.page').then((m) => m.BudgetsPage),
      },
      {
        path: 'goals',
        loadComponent: () =>
          import('./features/goals/goals.page').then((m) => m.GoalsPage),
      },
    ],
  },
  {
    path: 'settings',
    redirectTo: 'dashboard',
  },
];
