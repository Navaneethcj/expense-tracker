import { Expense, CategoryStats, IncomeEntry } from '@frontend/types';
import { getCategoryById } from '@frontend/constants/categories';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

export const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
};

export const sortExpensesByDate = (expenses: Expense[]): Expense[] => {
  return [...expenses].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
};

export const getMonthlyTotal = (expenses: Expense[], month?: number, year?: number): number => {
  const now = new Date();
  const targetMonth = month !== undefined ? month : now.getMonth();
  const targetYear = year !== undefined ? year : now.getFullYear();

  return expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === targetMonth &&
        expenseDate.getFullYear() === targetYear
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const getTodayTotal = (expenses: Expense[]): number => {
  const now = new Date();
  const today = now.toDateString();

  return expenses
    .filter((expense) => new Date(expense.date).toDateString() === today)
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const getTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

export const filterByCategory = (expenses: Expense[], categoryId: string): Expense[] => {
  if (!categoryId || categoryId === 'all') return expenses;
  return expenses.filter((expense) => expense.category === categoryId);
};

export const searchExpenses = (expenses: Expense[], query: string): Expense[] => {
  if (!query.trim()) return expenses;
  const lowercaseQuery = query.toLowerCase().trim();
  return expenses.filter((expense) =>
    expense.description.toLowerCase().includes(lowercaseQuery)
  );
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getRecentExpenses = (expenses: Expense[], count: number = 5): Expense[] => {
  return sortExpensesByDate(expenses).slice(0, count);
};

export const getMonthlyIncomes = <T extends { date: string; amount: number }>(items: T[], month?: number, year?: number): number => {
  const now = new Date();
  const targetMonth = month !== undefined ? month : now.getMonth();
  const targetYear = year !== undefined ? year : now.getFullYear();

  return items
    .filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getMonth() === targetMonth &&
        itemDate.getFullYear() === targetYear
      );
    })
    .reduce((sum, item) => sum + item.amount, 0);
};

export const getHighestCategory = (expenses: Expense[], month?: number, year?: number): CategoryStats | null => {
  const now = new Date();
  const targetMonth = month !== undefined ? month : now.getMonth();
  const targetYear = year !== undefined ? year : now.getFullYear();

  const monthlyExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getMonth() === targetMonth &&
      expenseDate.getFullYear() === targetYear
    );
  });

  if (monthlyExpenses.length === 0) return null;

  const categoryTotals: Record<string, number> = {};
  monthlyExpenses.forEach((expense) => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });

  const totalSpending = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  let highestCategoryId = '';
  let highestAmount = 0;

  Object.entries(categoryTotals).forEach(([categoryId, amount]) => {
    if (amount > highestAmount) {
      highestAmount = amount;
      highestCategoryId = categoryId;
    }
  });

  const category = getCategoryById(highestCategoryId);
  if (!category) return null;

  return {
    categoryId: highestCategoryId,
    categoryName: category.name,
    totalAmount: highestAmount,
    percentage: Math.round((highestAmount / totalSpending) * 100),
    color: category.color,
  };
};

export interface MonthlySummary {
  month: number;
  year: number;
  monthName: string;
  totalExpenses: number;
  totalIncome: number;
  savings: number;
  transactionCount: number;
  highestCategory: CategoryStats | null;
}

export const getMonthlyHistory = (expenses: Expense[], incomes: IncomeEntry[]): MonthlySummary[] => {
  const monthsMap = new Map<string, { expenses: Expense[]; incomes: IncomeEntry[] }>();

  // Group expenses by month
  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!monthsMap.has(key)) {
      monthsMap.set(key, { expenses: [], incomes: [] });
    }
    monthsMap.get(key)!.expenses.push(expense);
  });

  // Group incomes by month
  incomes.forEach((income) => {
    const date = new Date(income.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!monthsMap.has(key)) {
      monthsMap.set(key, { expenses: [], incomes: [] });
    }
    monthsMap.get(key)!.incomes.push(income);
  });

  const summaries: MonthlySummary[] = [];

  monthsMap.forEach((data, key) => {
    const [year, month] = key.split('-').map(Number);
    const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = data.incomes.reduce((sum, i) => sum + i.amount, 0);

    // Get highest category for this month
    const categoryTotals: Record<string, number> = {};
    data.expenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    let highestCategory: CategoryStats | null = null;
    if (Object.keys(categoryTotals).length > 0) {
      let highestCategoryId = '';
      let highestAmount = 0;

      Object.entries(categoryTotals).forEach(([categoryId, amount]) => {
        if (amount > highestAmount) {
          highestAmount = amount;
          highestCategoryId = categoryId;
        }
      });

      const category = getCategoryById(highestCategoryId);
      if (category) {
        highestCategory = {
          categoryId: highestCategoryId,
          categoryName: category.name,
          totalAmount: highestAmount,
          percentage: Math.round((highestAmount / totalExpenses) * 100),
          color: category.color,
        };
      }
    }

    summaries.push({
      month,
      year,
      monthName: new Date(year, month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      totalExpenses,
      totalIncome,
      savings: totalIncome - totalExpenses,
      transactionCount: data.expenses.length,
      highestCategory,
    });
  });

  // Sort by most recent first
  return summaries.sort((a, b) => {
    const dateA = new Date(a.year, a.month).getTime();
    const dateB = new Date(b.year, b.month).getTime();
    return dateB - dateA;
  });
};

export const filterExpensesByMonth = (expenses: Expense[], month: number, year: number): Expense[] => {
  return expenses.filter((expense) => {
    const date = new Date(expense.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
};

export const filterIncomesByMonth = (incomes: IncomeEntry[], month: number, year: number): IncomeEntry[] => {
  return incomes.filter((income) => {
    const date = new Date(income.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
};

