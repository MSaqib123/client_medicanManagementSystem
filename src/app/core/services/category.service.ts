import { computed, effect, Injectable, Signal, signal } from '@angular/core';
import { Category, CreateCategory } from '../models';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { catchError, map, Observable, tap } from 'rxjs';
import { APP_CONSTANTS } from '../constants/app.constants';
import { API_ENDPOINTS } from '../api/api-endpoints';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends ApiService<Category[]> {
  // Signal state
  private searchSignal = signal<string>('');
  private pageSignal = signal<number>(1);
  private categoriesCache = signal<Category[]>([]);  // Local cache
  
  override get loading() {
    return this.loadingSignal.asReadonly();
  }
  override get error() {
    return this.errorSignal.asReadonly();
  }

  // Computed signals (derived state)  this will be drived where this service is used
  public categoriesSignal = computed(() => this.categoriesCache())
  public filteredCategories = computed(() => this.categoriesCache().filter(c => 
    c.name.toLowerCase().includes(this.searchSignal().toLowerCase())
  ))

  constructor(
    http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { 
    super(http, { useSignals: true });
    // Effect: Auto-fetch on signal change
    effect(() => {
      const search = this.searchSignal();
      const page = this.pageSignal();
      if (this.useSignals) {
        this.fetchCategories({ search, page }).subscribe(categories => this.categoriesCache.set(categories));
      }
    });
  }

  getCategorys(params?: { search?: string; page?: number; pageSize?: number }): Observable<Category[]> {
    const fullParams = { ...params, pageSize: params?.pageSize || APP_CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE };  
    return this.get(API_ENDPOINTS.categories, fullParams)
      .pipe(
        map((categories: any[]) => categories.sort((a, b) => a.name.localeCompare(b.name))),
        tap(
          categories => this.categoriesCache.set(categories)
        )
      )
  }


  create(category:CreateCategory):Observable<Category>{
    return this.post<Category>(API_ENDPOINTS.categories, category)
      .pipe(
        tap((c)=>{
          this.addToCache(c);
        }),
        catchError(this.errorHandler.handleError<Category>('create category'))
      )
  }

  update(category: Category): Observable<Category> {
    return this.put<Category>(`${API_ENDPOINTS.categories}/${category.id}`, category)
      .pipe(
        tap((updatedCategory) => {
          this.updateInCache(category.id, updatedCategory);
        }),
        catchError(this.errorHandler.handleError<Category>('update category'))
      )
  }

  deleteCategory(id:string):Observable<void>{
    return this.delete<void>(`${API_ENDPOINTS.categories}/${id}`)
      .pipe(
        tap(() => {
          this.removeFromCache(id);
        }),
        catchError(this.errorHandler.handleError<void>('delete category'))
      );
  }
  
  private addToCache(category: Category): void {
      this.categoriesCache.update(list => [...list, category]);
    }
  
    private updateInCache(id: string, updated: Category): void {
      this.categoriesCache.update(list =>
        list.map(b => b.id === id ? updated : b)
      );
    }
  
    private removeFromCache(id: string): void {
      this.categoriesCache.update(list =>
        list.filter(b => b.id !== id)
      );
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


  getCategorySignal(initial:Category[] = []):Signal<Category[]>{
    return toSignal(this.getCategorys(), { initialValue: initial });
  }



  fetchCategories(params:any):Observable<Category[]>{
    return this.getCategorys(params);
  }
}
