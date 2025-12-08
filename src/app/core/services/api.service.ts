// core/services/api.service.ts
import { Injectable, Inject, signal, Signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, map, shareReplay } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';

/**
 * Generic HTTP API service with dual RxJS/Signal support.
 * @description Base for all. RxJS for async; Signals for reactive state. Set useSignals in ctor for global mode.
 * @template T Response type.
 * @example new ApiService(http, { useSignals: true }) for signal-first.
 */
@Injectable({ providedIn: 'root' })
export class ApiService<T = any> {
  protected baseUrl = environment.apiUrl;
  protected headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  protected useSignals: boolean;  // Optional flag

  // Signal state (lazy init)
  protected loadingSignal = signal<boolean>(false);
  protected errorSignal = signal<string | null>(null);

  constructor(
    protected http: HttpClient,
    @Inject('API_SERVICE_OPTIONS') options?: { useSignals?: boolean },
    @Inject('RETRY_COUNT') protected retryCount: number = 3
  ) {
    this.useSignals = options?.useSignals ?? false;  // Default RxJS
  }

  /**
   * GET - RxJS Observable.
   */
  get(endpoint: string, params?: any): Observable<T> {
    this.loadingSignal.set(true);
    let httpParams = new HttpParams();
    Object.keys(params || {}).forEach(key => httpParams = httpParams.set(key, params[key]));
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams, headers: this.headers })
      .pipe(
        retry(this.retryCount),
        shareReplay(1),  // Cache for multiple subs
        catchError(this.handleError),
        map(data => {
          this.loadingSignal.set(false);
          return data;
        })
      );
  }

  /**
   * GET as Signal (computed from observable).
   * @param obs$ Source observable.
   * @param initial Initial value for signal.
   * @returns Signal<T>.
   */
  getAsSignal(obs$: Observable<T>, initial: T): Signal<T> {
    return computed(() => toSignal(obs$, { initialValue: initial })());
  }

  // Similar for post, put, delete (add loading/error signals)

  post(endpoint: string, body: any): Observable<T> {
    this.loadingSignal.set(true);
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, { headers: this.headers })
      .pipe(
        retry(this.retryCount),
        catchError(this.handleError),
        map(data => {
          this.loadingSignal.set(false);
          return data;
        })
      );
  }

  // ... (put/delete similar)

  /**
   * Handle error with signal update.
   */
  private handleError(err: any): Observable<never> {
    this.errorSignal.set(err.message || 'Unknown error');
    this.loadingSignal.set(false);
    return throwError(() => err);
  }

  // Getters for signals
  get loading(): Signal<boolean> { return this.loadingSignal.asReadonly(); }
  get error(): Signal<string | null> { return this.errorSignal.asReadonly(); }
}