export interface CategoryOption {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryOption[] = [
  { id: 'food', name: 'Food', icon: '🍽️', color: '#F59E0B' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#3B82F6' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#EC4899' },
  { id: 'utilities', name: 'Utilities', icon: '💡', color: '#10B981' },
  { id: 'health', name: 'Health', icon: '🩺', color: '#EF4444' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#8B5CF6' },
];

export const getCategoryById = (categoryId: string) => CATEGORIES.find((category) => category.id === categoryId);
