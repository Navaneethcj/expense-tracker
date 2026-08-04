import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authRepository } from './auth.repository';
import { LoginInput, RegisterInput, AuthUserPayload } from './auth.types';
import { sendPasswordResetEmail } from '../../utils/email';

const generateToken = (user: AuthUserPayload) => {
  const secret = process.env.JWT_SECRET || 'development-secret';

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions
  );
};

export const authService = {
  register: async (input: RegisterInput) => {
    const existingUser = await authRepository.findUserByEmail(input.email);

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await authRepository.createUser({
      name: input.name,
      email: input.email,
      password: hashedPassword,
    });

    return {
      token: generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
      }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  },

  login: async (input: LoginInput) => {
    const user = await authRepository.findUserByEmail(input.email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      input.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return {
      token: generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
      }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  },

  forgotPassword: async (email: string) => {
    const user = await authRepository.findUserByEmail(email);

    // Always return successfully to avoid revealing whether an email exists.
    if (!user) {
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const resetTokenExpiry = new Date(
      Date.now() + 60 * 60 * 1000
    );

    await authRepository.saveResetToken(
      user.id,
      resetToken,
      resetTokenExpiry
    );

    await sendPasswordResetEmail(
      user.email,
      resetToken
    );
  },

  resetPassword: async (
    token: string,
    password: string
  ) => {
    const user =
      await authRepository.findUserByResetToken(token);

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    if (
      !user.resetTokenExpiry ||
      user.resetTokenExpiry.getTime() < Date.now()
    ) {
      throw new Error('Reset token has expired');
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    await authRepository.updatePassword(
      user.id,
      hashedPassword
    );
  },

  getProfile: async (userId: string) => {
    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  },
};