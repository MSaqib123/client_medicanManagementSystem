// core/constants/app.constants.ts
/**
 * App-wide constants.
 * @description Immutable; use in templates/services.
 */
export const APP_CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100
  } as const,
  MEDICINE_TYPES: [
    'Tablet', 'Capsule', 'Liquid', 'Drops', 'Injection', 'Ointment', 'Syrup', 'Powder', 'Inhaler', 'Patch', 'Suppository', 'Cream', 'Gel', 'Spray'
  ] as const,
  PAYMENT_MODES: ['Cash', 'Card', 'UPI', 'Cheque'] as const,
  STATUSES: {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    EXPIRED: 'Expired'
  } as const,
  ROLES: {
    ADMIN: 'Admin',
    USER: 'User',
    MANAGER: 'Manager'
  } as const
} as const;