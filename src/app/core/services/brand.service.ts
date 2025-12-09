// core/services/brand.service.ts
import { Injectable, signal, computed, effect, Signal } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, shareReplay, tap, map, catchError } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { Brand, CreateBrand } from '../models';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../api/api-endpoints';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { APP_CONSTANTS } from '../constants/app.constants';
import { HttpClient } from '@angular/common/http';

/**
 * Brand service with dual RxJS/Signal support.
 * @description RxJS for async ops; Signals for reactive UI state. Pass { useSignals: true } to ctor.
 * @example RxJS: service.getBrands().subscribe(); Signal: @ViewChild signal = service.brandsSignal;
 */
@Injectable({ providedIn: 'root' })
export class BrandService extends ApiService<Brand[]> {


  update(id: string, payload: Partial<Brand>): Observable<Brand> {
    // Real: return this.put(`${API_ENDPOINTS.brands}/${id}`, payload);
    // Stub for now
    return of({ ...payload, id } as Brand).pipe(
      tap(() => this.invalidateCache()),
      catchError(err => {
        console.error('Update error', err);
        return of({} as Brand);
      })
    );
  }

  delete(id: string): Observable<void> {
    // Real: return this.delete(`${API_ENDPOINTS.brands}/${id}`);
    // Stub
    return of(undefined).pipe(tap(() => this.invalidateCache()));
  }

  // Signal state
  private searchSignal = signal<string>('');
  private pageSignal = signal<number>(1);
  private brandsCache = signal<Brand[]>([]);  // Local cache
  override get loading() {
    return this.loadingSignal.asReadonly();
  }
  override get error() {
    return this.errorSignal.asReadonly();
  }

  // Computed signals (derived state)
  public brandsSignal = computed(() => this.brandsCache());
  public filteredBrands = computed(() => this.brandsCache().filter(b => 
    b.name.toLowerCase().includes(this.searchSignal().toLowerCase())
  ));
  public totalPages = computed(() => Math.ceil(this.brandsCache().length / APP_CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE));

  // Effect for auto-refetch on search/page change
  constructor(
    http: HttpClient,
    private errorHandler: ErrorHandlerService,
    // options?: { useSignals?: boolean } = {}
  ) {
    // super(http, options);
    super(http);
    // Effect: Auto-fetch on signal change
    effect(() => {
      const search = this.searchSignal();
      const page = this.pageSignal();
      if (this.useSignals) {
        this.fetchBrands({ search, page }).subscribe(brands => this.brandsCache.set(brands));
      }
    });
  }

  /**
   * Get brands - RxJS (default).
   * @param params Optional filters.
   * @returns Observable<Brand[]>.
   */
  getBrands(params?: { search?: string; page?: number; pageSize?: number }): Observable<Brand[]> {
    const fullParams = { ...params, pageSize: params?.pageSize || APP_CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE };
    return this.get(API_ENDPOINTS.brands, fullParams)
      .pipe(
        tap(brands => {
          if (this.useSignals) this.brandsCache.set(brands);  // Update signal if mode on
        }),
        map((brands: any[]) => brands.sort((a, b) => a.name.localeCompare(b.name)))
      );
  }

  /**
   * Get brands as Signal.
   * @param initial Initial array.
   * @returns Signal<Brand[]>.
   */
  getBrandsSignal(initial: Brand[] = []): Signal<Brand[]> {
    return toSignal(this.getBrands(), { initialValue: initial });
  }

  /**
   * Reactive search - Update signal.
   * @param term Search term.
   */
  search(term: string): void {
    this.searchSignal.set(term);
  }

  /**
   * Set page - Update signal.
   * @param page Page number.
   */
  setPage(page: number): void {
    this.pageSignal.set(page);
  }

  /**
   * Create - RxJS.
   */
  create(brand: CreateBrand): Observable<Brand> {
    return this.post(API_ENDPOINTS.brands, brand)
      .pipe(
        tap(() => this.invalidateCache()),  // Effect triggers refetch
        catchError(this.errorHandler.handleError<Brand>('createBrand'))
      );
  }

  /**
   * Create with Signal update.
   */
  createSignal(brand: CreateBrand): Signal<Brand | null> {
    const resultSignal = signal<Brand | null>(null);
    this.create(brand).subscribe({
      next: data => resultSignal.set(data),
      error: () => resultSignal.set(null)
    });
    return resultSignal.asReadonly();
  }

  // Update, delete similar (tap to invalidate, return Signal option)

  invalidateCache(): void {
    this.brandsCache.set([]);  // Trigger effect refetch
  }

  fetchBrands(params: any): Observable<Brand[]> {
    // Internal fetch (debounced RxJS)
    return this.getBrands(params).pipe(shareReplay(1));
  }
}