// core/models/category.model.ts
/**
 * Category entity.
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  createdByUserId: string;
  updatedAt?: Date;
  updatedByUserId?: string;
}

export type CreateCategory = Omit<Category, 'id' | 'createdAt' | 'updatedByUserId' | 'updatedAt'>;