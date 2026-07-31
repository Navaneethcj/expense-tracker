import { prisma } from '../../config/prisma';
import { RegisterInput } from './auth.types';

export const authRepository = {
  findUserByEmail: async (email: string) =>
    prisma.user.findUnique({
      where: { email },
    }),

  findUserById: async (id: string) =>
    prisma.user.findUnique({
      where: { id },
    }),

  createUser: async (data: RegisterInput & { password: string }) =>
    prisma.user.create({
      data,
    }),

  saveResetToken: async (
    userId: string,
    resetToken: string,
    resetTokenExpiry: Date
  ) =>
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    }),

  findUserByResetToken: async (resetToken: string) =>
    prisma.user.findFirst({
      where: {
        resetToken,
      },
    }),

  updatePassword: async (
    userId: string,
    hashedPassword: string
  ) =>
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    }),
};