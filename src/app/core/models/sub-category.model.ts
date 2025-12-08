// core/models/sub-category.model.ts
/**
 * SubCategory entity with FK to Category.
 */
export interface SubCategory {
  id: string;
  name: string;
  description?: string;
  categoryId: string;  // FK
  createdAt: Date;
  createdByUserId: string;
  updatedAt?: Date;
  updatedByUserId?: string;
}

export type CreateSubCategory = Omit<SubCategory, 'id' | 'createdAt' | 'updatedByUserId' | 'updatedAt'>;