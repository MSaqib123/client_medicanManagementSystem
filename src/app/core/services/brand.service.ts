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
    super(http, { useSignals: true });
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
        map((brands: any[]) =>
          brands
            .map(b => ({
              ...b,
              status: b.status ?? 'active'   // 👈 default status if missing or null
            }) as Brand)
            .sort((a, b) => a.name.localeCompare(b.name))
        ),
        tap(brands => {
          console.log('Normalized brands:', brands);
          if (this.useSignals) this.brandsCache.set(brands);
        })
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
    const payload = { name: brand.name };

    return this.post<Brand>(API_ENDPOINTS.brands, payload).pipe(
      tap(newBrand => {
        this.addToCache({
          ...newBrand,
          status: newBrand.status ?? 'active'
        });
      }),
      catchError(this.errorHandler.handleError<Brand>('createBrand'))
    );
  }


  update(id: string, payload: Partial<Brand>): Observable<Brand> {
    let s = { name: payload.name, id: id };
    console.log(s)
    return this.put<Brand>(`${API_ENDPOINTS.brands}/${id}`, s).pipe(
      tap(updated => this.updateInCache(id, {...updated, status: updated.status ?? 'active'})),
      catchError(this.errorHandler.handleError<Brand>('updateBrand'))
    );
  }


  deleteBrand(id: string): Observable<void> {
    return this.delete<void>(`${API_ENDPOINTS.brands}/${id}`).pipe(
      tap(() => this.removeFromCache(id)),
      catchError(this.errorHandler.handleError<void>('deleteBrand'))
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

  
  private addToCache(brand: Brand): void {
    this.brandsCache.update(list => [...list, brand]);
  }

  private updateInCache(id: string, updated: Brand): void {
    this.brandsCache.update(list =>
      list.map(b => b.id === id ? updated : b)
    );
  }

  private removeFromCache(id: string): void {
    this.brandsCache.update(list =>
      list.filter(b => b.id !== id)
    );
  }

  fetchBrands(params: any): Observable<Brand[]> {
    // Internal fetch (debounced RxJS)
    return this.getBrands(params).pipe(shareReplay(1));
  }
}