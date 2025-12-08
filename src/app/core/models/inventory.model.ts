// core/models/inventory.model.ts (Add computed props)
export interface Inventory {
  id: string;
  medicineId: string;
  branchId: string;
  batchNumber?: string;
  expiryDate: Date;
  quantityInStock: number;
  quantitySold: number;
  quantityOut: number;
  purchasePrice: number;
  retailPrice: number;
  profitMargin: number;  // Computed: (retail - purchase) / purchase * 100
  minStockLevel: number;
  isExpired: boolean;  // Computed: expiryDate < now
  stockHandlingMethod?: string;
  createdAt: Date;
  createdByUserId: string;
  updatedAt?: Date;
  updatedByUserId?: string;
}

export type CreateInventory = Omit<Inventory, 'id' | 'createdAt' | 'isExpired' | 'profitMargin' | 'updatedByUserId' | 'updatedAt'>;