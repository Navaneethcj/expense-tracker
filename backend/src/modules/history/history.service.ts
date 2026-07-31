import { prisma } from '../../config/prisma';

export const historyService = {
  getMonthlySummary: async (userId: string) => {
    const expenses = await prisma.expense.findMany({
  where: { userId },
});



    const incomes = await prisma.income.findMany({
      where: { userId },
    });

    const grouped = new Map<
      string,
      {
        expense: number;
        income: number;
        transactions: string[];
      }
    >();

    expenses.forEach((expense) => {
      const month = expense.date.toISOString().slice(0, 7);
      const current = grouped.get(month) || {
        expense: 0,
        income: 0,
        transactions: [],
      };

      current.expense += expense.amount;
      current.transactions.push(expense.id);
      grouped.set(month, current);
    });

    incomes.forEach((income) => {
      const month = income.date.toISOString().slice(0, 7);
      const current = grouped.get(month) || {
        expense: 0,
        income: 0,
        transactions: [],
      };

      current.income += income.amount;
      grouped.set(month, current);
    });

    return Array.from(grouped.entries()).map(([month, entry]) => ({
      month,
      expense: entry.expense,
      income: entry.income,
      balance: entry.income - entry.expense,
      transactions: entry.transactions,
    }));
  },
};