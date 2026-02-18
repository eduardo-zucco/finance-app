export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;

  // O Básico
  description: string; // Ex: "Mercado", "Salário"
  amount: number; // Sempre positivo
  date: string; // ISO String (Data da competência)

  // Classificação
  type: TransactionType;
  categoryId: string;
  accountId: string;

  // Controle
  isPaid: boolean; // Se false, não desconta do saldo ainda

  // Apenas para Transferências
  destinationAccountId?: string;

  // Auditoria
  createdAt: number; // Timestamp (Date.now())
}
