import { incomeRepository } from './income.repository';

export const incomeService = {
  list: async (userId: string) => incomeRepository.findMany(userId),
  getById: async (id: string, userId: string) => incomeRepository.findById(id, userId),
  create: async (data: { title: string; amount: number; category: string; description: string | null; date: string; userId: string }) => {
    return incomeRepository.create({
      title: data.title,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: new Date(data.date),
      userId: data.userId,
    });
  },
  update: async (id: string, userId: string, data: { title?: string; amount?: number; category?: string; description?: string | null; date?: string }) => {
    const existingIncome = await incomeRepository.findById(id, userId);
    if (!existingIncome) {
      throw new Error('Income not found');
    }

    return incomeRepository.update(id, {
      title: data.title,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date ? new Date(data.date) : undefined,
    });
  },
  remove: async (id: string, userId: string) => {
    const existingIncome = await incomeRepository.findById(id, userId);
    if (!existingIncome) {
      throw new Error('Income not found');
    }

    return incomeRepository.delete(id);
  },
};
