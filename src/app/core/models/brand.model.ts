// core/models/brand.model.ts
/**
 * Brand entity model.
 * @description Mirrors backend Brand. Use Omit for create payloads.
 */
export interface Brand {
  id: string;  // GUID as string
  name: string;
  createdAt: Date;
  createdByUserId: string;
  updatedAt?: Date;
  updatedByUserId?: string;
}

/**
 * CreateBrand payload (excludes audit fields).
 */
export type CreateBrand = Omit<Brand, 'id' | 'createdAt' | 'updatedByUserId' | 'updatedAt'>;