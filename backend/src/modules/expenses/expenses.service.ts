import { expensesRepository } from './expenses.repository';

export const expensesService = {
  list: async (userId: string) => expensesRepository.findMany(userId),
  getById: async (id: string, userId: string) => expensesRepository.findById(id, userId),
  create: async (data: { title: string; amount: number; category: string; description: string | null; date: string; userId: string }) => {
    return expensesRepository.create({
      title: data.title,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: new Date(data.date),
      userId: data.userId,
    });
  },
  update: async (id: string, userId: string, data: { title?: string; amount?: number; category?: string; description?: string | null; date?: string }) => {
    const existingExpense = await expensesRepository.findById(id, userId);
    if (!existingExpense) {
      throw new Error('Expense not found');
    }

    return expensesRepository.update(id, {
      title: data.title,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date ? new Date(data.date) : undefined,
    });
  },
  remove: async (id: string, userId: string) => {
    const existingExpense = await expensesRepository.findById(id, userId);
    if (!existingExpense) {
      throw new Error('Expense not found');
    }

    return expensesRepository.delete(id);
  },
};
