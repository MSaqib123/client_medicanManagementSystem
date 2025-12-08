// core/models/medicine.model.ts
/**
 * Medicine entity with relations.
 */
export interface Medicine {
  id: string;
  name: string;
  medicineTypeId: string;
  brandId: string;
  composition?: string;
  dosage?: string;
  sideEffects?: string;
  categoryId?: string;
  subCategoryId?: string;
  barcode?: string;
  createdAt: Date;
  createdByUserId: string;
  updatedAt?: Date;
  updatedByUserId?: string;
}

export type CreateMedicine = Omit<Medicine, 'id' | 'createdAt' | 'updatedByUserId' | 'updatedAt'>;