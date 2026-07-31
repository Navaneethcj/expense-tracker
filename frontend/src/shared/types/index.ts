export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface IncomeEntry {
  id: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  percentage: number;
  color: string;
}
