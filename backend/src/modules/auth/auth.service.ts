import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRepository } from './auth.repository';
import { LoginInput, RegisterInput, AuthUserPayload } from './auth.types';

const generateToken = (user: AuthUserPayload) => {
  const secret = process.env.JWT_SECRET || 'development-secret';
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
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
      token: generateToken({ id: user.id, email: user.email, name: user.name }),
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    };
  },

  login: async (input: LoginInput) => {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return {
      token: generateToken({ id: user.id, email: user.email, name: user.name }),
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    };
  },

  getProfile: async (userId: string) => {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return { user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } };
  },
};
