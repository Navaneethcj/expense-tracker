import { prisma } from '../../config/prisma';

export const expensesRepository = {
  findMany: async (userId: string) => prisma.expense.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
  findById: async (id: string, userId: string) => prisma.expense.findFirst({ where: { id, userId } }),
  create: async (data: { title: string; amount: number; category: string; description: string | null; date: Date; userId: string }) => prisma.expense.create({ data }),
  update: async (id: string, data: { title?: string; amount?: number; category?: string; description?: string | null; date?: Date }) => prisma.expense.update({ where: { id }, data }),
  delete: async (id: string) => prisma.expense.delete({ where: { id } }),
};
