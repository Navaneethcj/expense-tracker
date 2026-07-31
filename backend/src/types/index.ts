export interface AuthPayload {
  id: string;
  email: string;
  name: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  amount: number;
  category: string;
  description?: string | null;
  date: Date;
  userId: string;
  createdAt: Date;
}

export interface IncomeRecord {
  id: string;
  title: string;
  amount: number;
  category: string;
  description?: string | null;
  date: Date;
  userId: string;
  createdAt: Date;
}

export interface SettingsRecord {
  id: string;
  currency: string;
  theme: string;
  notifications: boolean;
  userId: string;
  createdAt: Date;
}

export interface MonthlySummaryResponse {
  month: string;
  income: number;
  expense: number;
  balance: number;
  transactions: Array<{
    id: string;
    type: 'income' | 'expense';
    title: string;
    amount: number;
    category: string;
    date: string;
  }>;
}
