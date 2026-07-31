import api from '../../../shared/api/client';

export interface ExpensePayload {
  id?: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export const getExpenses = async () => {
  const response = await api.get('/api/expenses');
  return response.data.data;
};

export const createExpense = async (payload: ExpensePayload) => {
  const response = await api.post('/api/expenses', payload);
  return response.data.data;
};

export const updateExpense = async (id: string, payload: ExpensePayload) => {
  const response = await api.put(`/api/expenses/${id}`, payload);
  return response.data.data;
};

export const deleteExpense = async (id: string) => {
  const response = await api.delete(`/api/expenses/${id}`);
  return response.data.data;
};
