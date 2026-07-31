import { prisma } from '../../config/prisma';

export const incomeRepository = {
  findMany: async (userId: string) => prisma.income.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
  findById: async (id: string, userId: string) => prisma.income.findFirst({ where: { id, userId } }),
  create: async (data: { title: string; amount: number; category: string; description: string | null; date: Date; userId: string }) => prisma.income.create({ data }),
  update: async (id: string, data: { title?: string; amount?: number; category?: string; description?: string | null; date?: Date }) => prisma.income.update({ where: { id }, data }),
  delete: async (id: string) => prisma.income.delete({ where: { id } }),
};
