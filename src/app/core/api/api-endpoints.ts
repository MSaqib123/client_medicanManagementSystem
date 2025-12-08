// core/api/api-endpoints.ts
/**
 * Immutable API endpoint constants.
 * @description Environment-driven. Use template literals for params.
 * @example `${API_ENDPOINTS.brands}/search?q=${searchTerm}`
 */
import { environment } from '../../../environments/environment';

export const API_ENDPOINTS = {
  base: environment.apiUrl,
  auth: {
    login: 'auth/login',
    register: 'auth/register'
  },
  brands: 'brand',
  categories: 'category',
  subCategories: 'subcategory',
  medicines: 'medicine',
  inventories: 'inventory',
  sales: 'sale',
  purchases: 'purchase',
  suppliers: 'supplier',
  branches: 'branch',
  tenants: 'tenant',
  reports: 'reports/sales',  // e.g., /reports/sales?start=2025-01-01&end=2025-12-31
  settings: 'settings'
} as const;

/**
 * Full URL builder.
 * @param endpoint Base endpoint (e.g., 'brand').
 * @param params Query params object.
 * @returns Full URL string.
 */
export function buildUrl(endpoint: string, params?: Record<string, any>): string {
  let url = `${environment.apiUrl}${endpoint}`;
  if (params) {
    const query = new URLSearchParams(params).toString();
    url += `?${query}`;
  }
  return url;
}