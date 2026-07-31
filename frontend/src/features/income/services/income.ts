import api from '../../../shared/api/client';

export interface IncomePayload {
  id?: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export const getIncomes = async () => {
  const response = await api.get('/api/income');
  return response.data.data;
};

export const createIncome = async (payload: IncomePayload) => {
  const response = await api.post('/api/income', payload);
  return response.data.data;
};

export const updateIncome = async (id: string, payload: IncomePayload) => {
  const response = await api.put(`/api/income/${id}`, payload);
  return response.data.data;
};

export const deleteIncome = async (id: string) => {
  const response = await api.delete(`/api/income/${id}`);
  return response.data.data;
};

export const getHistory = async () => {
  const response = await api.get('/api/history');
  return response.data.data;
};
