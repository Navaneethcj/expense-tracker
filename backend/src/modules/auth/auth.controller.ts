import { validationResult } from 'express-validator';
import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendError, sendSuccess } from '../../utils/response';
import { AuthenticatedRequest } from '../../interfaces/request';

export const authController = {
  register: async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, errors.array()[0].msg);
    }

    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, 201, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to register user';
      return sendError(res, message === 'User already exists' ? 409 : 500, message);
    }
  },

  login: async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, errors.array()[0].msg);
    }

    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, 200, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to login';
      return sendError(res, message === 'Invalid credentials' ? 401 : 500, message);
    }
  },

  forgotPassword: async (req: Request, res: Response) => {
  try {
    console.log("========== CONTROLLER ==========");
    console.log("Request Body:", req.body);
    console.log("Email:", JSON.stringify(req.body.email));

    const { email } = req.body;

    await authService.forgotPassword(email);

    return sendSuccess(res, 200, {
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to process forgot password request";

    return sendError(res, 500, message);
  }
},

resetPassword: async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    await authService.resetPassword(token, password);

    return sendSuccess(res, 200, {
      message: 'Password reset successful.',
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to reset password';

    return sendError(
      res,
      message === 'Invalid or expired reset token' ||
      message === 'Reset token has expired'
        ? 400
        : 500,
      message
    );
  }
},

  profile: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await authService.getProfile(req.user?.id || '');
      return sendSuccess(res, 200, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve profile';
      return sendError(res, message === 'User not found' ? 404 : 500, message);
    }
  },
};
