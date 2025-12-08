// core/services/loading.service.ts
import { computed, Injectable, Signal, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loadingCount = signal<number>(0);

  setLoading(loading: boolean, url?: string): void {
    if (loading) this.loadingCount.update(count => count + 1);
    else this.loadingCount.update(count => Math.max(0, count - 1));
  }

  get isLoading(): Signal<boolean> { return computed(() => this.loadingCount() > 0); }
  get loadingCountSignal(): Signal<number> { return this.loadingCount.asReadonly(); }
}