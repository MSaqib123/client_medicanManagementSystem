// core/models/sale.model.ts (With nested items)
export interface Sale {
  id: string;
  branchId: string;
  saleDate: Date;
  totalAmount: number;
  discount: number;
  tax: number;
  paymentMode?: string;
  prescriptionUrl?: string;
  loyaltyPoints: number;
  invoiceBarcode?: string;
  isReturned: boolean;
  refundAmount: number;
  items: SaleItem[];  // Nested
  createdAt: Date;
  createdByUserId: string;
  updatedAt?: Date;
  updatedByUserId?: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  inventoryId: string;
  quantity: number;
  price: number;
  createdAt: Date;
  createdByUserId: string;
  updatedAt?: Date;
  updatedByUserId?: string;
}

export type CreateSale = Omit<Sale, 'id' | 'createdAt' | 'updatedByUserId' | 'updatedAt'> & { items: Omit<SaleItem, 'id' | 'createdAt' | 'updatedByUserId' | 'updatedAt'>[] };