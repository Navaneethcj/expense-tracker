import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendError, sendSuccess } from '../utils/response';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const expenses = await prisma.expense.findMany({ where: { userId: req.user!.id } });
    const incomes = await prisma.income.findMany({ where: { userId: req.user!.id } });

    const transactions = [
      ...expenses.map((item: any) => ({ ...item, type: 'expense' as const })),
      ...incomes.map((item: any) => ({ ...item, type: 'income' as const })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const grouped = new Map<string, { income: number; expense: number; transactions: any[] }>();
    for (const transaction of transactions) {
      const monthKey = new Date(transaction.date).toISOString().slice(0, 7);
      const current = grouped.get(monthKey) ?? { income: 0, expense: 0, transactions: [] };
      if (transaction.type === 'income') {
        current.income += Number(transaction.amount);
      } else {
        current.expense += Number(transaction.amount);
      }
      current.transactions.push({
        id: transaction.id,
        type: transaction.type,
        title: transaction.title,
        amount: Number(transaction.amount),
        category: transaction.category,
        date: transaction.date.toISOString(),
      });
      grouped.set(monthKey, current);
    }

    const response = Array.from(grouped.entries())
      .map(([month, value]) => ({
        month,
        income: value.income,
        expense: value.expense,
        balance: value.income - value.expense,
        transactions: value.transactions,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return sendSuccess(res, 200, response);
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch history');
  }
});

export default router;
