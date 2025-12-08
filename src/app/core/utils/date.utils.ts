// core/utils/date.utils.ts
/**
 * Date utilities.
 * @description Pipe-friendly, timezone-aware.
 */
import { DatePipe } from '@angular/common';

export class DateUtils {
  /**
   * Format date.
   * @param date Input date.
   * @param format Pipe format.
   * @returns Formatted string.
   */
  static format(date: Date | string, format = 'MMM dd, yyyy'): string {
    return new DatePipe('en-US').transform(new Date(date), format) || '';
  }

  /**
   * Check expiry.
   * @param expiry Expiry date.
   * @returns True if expired.
   */
  static isExpired(expiry: Date): boolean {
    return new Date(expiry) < new Date();
  }
}
