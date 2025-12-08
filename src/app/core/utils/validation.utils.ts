
// core/utils/validation.utils.ts
/**
 * Validation helpers.
 */
export class ValidationUtils {
  static isValidUrl: any;
  /**
   * Validate barcode.
   * @param barcode Input.
   * @returns True if valid.
   */
  static isValidBarcode(barcode: string): boolean {
    return /^[A-Z0-9]{8,20}$/i.test(barcode);
  }

  /**
   * Calculate margin.
   * @param purchase Purchase price.
   * @param retail Retail price.
   * @returns Percentage.
   */
  static calculateMargin(purchase: number, retail: number): number {
    return Math.round(((retail - purchase) / purchase) * 100);
  }
}