export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  amount: number;
  date: string; // ISO 8601
  categoryId: string;
  accountId: string;
  type: TransactionType;
  note?: string;
  toAccountId?: string; // For transfers
}
