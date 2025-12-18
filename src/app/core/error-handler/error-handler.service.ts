// core/error-handler/error-handler.service.ts
/**
 * Global error handler service.
 * @description Toastr integration; log to console (extend to Sentry).
 */
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
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
  
  constructor(private toastr: ToastrService) {}

  handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {

      console.group(`${operation} failed`);
      console.error(error);
      console.groupEnd();

      const msg = this.mapError(error);
      this.toastr.error(msg, operation);

      // 👈 IMPORTANT: return fallback, NOT throw
      return of(result as T);
    };
  }

  private mapError(error: HttpErrorResponse): string {
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