import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, IncomeEntry } from '@/src/types';

const EXPENSES_KEY = '@expenses';
const INCOME_KEY = '@income_entries';

// Fallback in-memory storage for when AsyncStorage fails
const memoryStorage: Record<string, string> = {};

// Helper to safely access AsyncStorage with fallback
const safeGetItem = async (key: string): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      memoryStorage[key] = value;
    }
    return value ?? memoryStorage[key] ?? null;
  } catch (error) {
    console.warn(`AsyncStorage getItem failed, using memory fallback for key: ${key}`);
    return memoryStorage[key] ?? null;
  }
};

const safeSetItem = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
    memoryStorage[key] = value;
  } catch (error) {
    console.warn(`AsyncStorage setItem failed, using memory fallback for key: ${key}`);
    memoryStorage[key] = value;
  }
};

const safeRemoveItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
    delete memoryStorage[key];
  } catch (error) {
    console.warn(`AsyncStorage removeItem failed, using memory fallback for key: ${key}`);
    delete memoryStorage[key];
  }
};

export const saveExpense = async (expense: Expense): Promise<void> => {
  try {
    const expenses = await getExpenses();
    expenses.push(expense);
    await safeSetItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Error saving expense:', error);
    throw error;
  }
};

export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const expensesJson = await safeGetItem(EXPENSES_KEY);
    return expensesJson ? JSON.parse(expensesJson) : [];
  } catch (error) {
    console.error('Error getting expenses:', error);
    return [];
  }
};

export const updateExpense = async (id: string, updatedExpense: Partial<Expense>): Promise<void> => {
  try {
    const expenses = await getExpenses();
    const index = expenses.findIndex((expense) => expense.id === id);
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...updatedExpense };
      await safeSetItem(EXPENSES_KEY, JSON.stringify(expenses));
    }
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  try {
    const expenses = await getExpenses();
    const filteredExpenses = expenses.filter((expense) => expense.id !== id);
    await safeSetItem(EXPENSES_KEY, JSON.stringify(filteredExpenses));
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

export const clearExpenses = async (): Promise<void> => {
  try {
    await safeRemoveItem(EXPENSES_KEY);
  } catch (error) {
    console.error('Error clearing expenses:', error);
    throw error;
  }
};

// Income functions
export const saveIncome = async (income: IncomeEntry): Promise<void> => {
  try {
    const incomes = await getIncomes();
    incomes.push(income);
    await safeSetItem(INCOME_KEY, JSON.stringify(incomes));
  } catch (error) {
    console.error('Error saving income:', error);
    throw error;
  }
};

export const getIncomes = async (): Promise<IncomeEntry[]> => {
  try {
    const incomesJson = await safeGetItem(INCOME_KEY);
    return incomesJson ? JSON.parse(incomesJson) : [];
  } catch (error) {
    console.error('Error getting incomes:', error);
    return [];
  }
};

export const updateIncome = async (id: string, updatedIncome: Partial<IncomeEntry>): Promise<void> => {
  try {
    const incomes = await getIncomes();
    const index = incomes.findIndex((income) => income.id === id);
    if (index !== -1) {
      incomes[index] = { ...incomes[index], ...updatedIncome };
      await safeSetItem(INCOME_KEY, JSON.stringify(incomes));
    }
  } catch (error) {
    console.error('Error updating income:', error);
    throw error;
  }
};

export const deleteIncome = async (id: string): Promise<void> => {
  try {
    const incomes = await getIncomes();
    const filteredIncomes = incomes.filter((income) => income.id !== id);
    await safeSetItem(INCOME_KEY, JSON.stringify(filteredIncomes));
  } catch (error) {
    console.error('Error deleting income:', error);
    throw error;
  }
};

export const clearIncomes = async (): Promise<void> => {
  try {
    await safeRemoveItem(INCOME_KEY);
  } catch (error) {
    console.error('Error clearing incomes:', error);
    throw error;
  }
};
