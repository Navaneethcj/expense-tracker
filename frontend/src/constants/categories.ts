import { Category } from '@frontend/types';

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', icon: 'UtensilsCrossed', color: '#F59E0B' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#EC4899' },
  { id: 'bills', name: 'Bills', icon: 'Receipt', color: '#8B5CF6' },
  { id: 'transport', name: 'Transport', icon: 'Car', color: '#3B82F6' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: '#10B981' },
  { id: 'medical', name: 'Medical', icon: 'HeartPulse', color: '#EF4444' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#06B6D4' },
  { id: 'others', name: 'Others', icon: 'MoreHorizontal', color: '#64748B' },
];

export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find((category) => category.id === id);
};

export const getCategoryColor = (id: string): string => {
  return getCategoryById(id)?.color || '#64748B';
};

