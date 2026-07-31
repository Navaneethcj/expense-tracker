import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import expenseRoutes from './modules/expenses/expenses.routes';
import incomeRoutes from './modules/income/income.routes';
import settingsRoutes from './modules/settings/settings.routes';
import historyRoutes from './modules/history/history.routes';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/history', historyRoutes);

export default app;
