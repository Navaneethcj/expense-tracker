import { prisma } from '../../config/prisma';
import { RegisterInput } from './auth.types';

export const authRepository = {
  findUserByEmail: async (email: string) => prisma.user.findUnique({ where: { email } }),
  findUserById: async (id: string) => prisma.user.findUnique({ where: { id } }),
  createUser: async (data: RegisterInput & { password: string }) => prisma.user.create({ data }),
};
