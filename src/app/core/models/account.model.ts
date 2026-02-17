export type AccountType = 'cash' | 'bank' | 'card' | 'savings' | 'investment';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
  icon: string;
}
