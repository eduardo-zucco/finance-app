export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly'; // For now only monthly
  month?: string; // Optional specific month YYYY-MM, if null applies to all months
}
