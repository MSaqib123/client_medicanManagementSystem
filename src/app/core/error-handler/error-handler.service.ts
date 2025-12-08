// core/error-handler/error-handler.service.ts
/**
 * Global error handler service.
 * @description Toastr integration; log to console (extend to Sentry).
 */
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

/**
 * Handle API errors.
 * @template T Error type.
 * @param operation Operation name for logging.
 * @param result Fallback value.
 * @returns Observable<T>.
 */
export function handleError<T>(operation = 'operation', result?: T) {
  return (error: any): Observable<T> => {
    console.group(`${operation} failed`);
    console.error(error);
    console.groupEnd();
    // User-friendly message
    const msg = error.status ? `Error ${error.status}: ${error.message}` : 'Connection failed';
    // Assume Toastr injected globally
    // this.toastr.error(msg);  // In full service
    return throwError(() => new Error(msg));
  };
}

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  handleError<T>(arg0: string): (err: any, caught: Observable<import("../models").Brand[]>) => import("rxjs").ObservableInput<any> {
      throw new Error('Method not implemented.');
  }
  constructor(private toastr: ToastrService) {}

  handleHttpError(error: HttpErrorResponse, operation: string): Observable<never> {
    const msg = this.mapError(error);
    this.toastr.error(msg, operation);
    return throwError(() => error);
  }

  private mapError(error: HttpErrorResponse): string {
    // Advanced mapping
    const messages: { [key: number]: string } = {
      400: 'Invalid input',
      401: 'Unauthorized - login again',
      403: 'Forbidden',
      404: 'Not found',
      500: 'Server down'
    };
    return messages[error.status] || error.error?.message || 'Unknown error';
  }
 }