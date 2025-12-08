import { computed, Signal, signal } from "@angular/core";
import { ApiService } from "./api.service";
import { LoginResponse, LoginRequest } from "../models/auth.models";
import { API_ENDPOINTS } from "../api/api-endpoints";
import { Observable, tap } from "rxjs";

// core/services/auth.service.ts (Snippet - Dual)
export class AuthService extends ApiService<LoginResponse> {
  private tokenSignal = signal<string | null>(localStorage.getItem('token'));
  public tokenSignal$ = this.tokenSignal; // Use the signal directly

  // If you need an Observable for RxJS compatibility, import toObservable:
  // import { toObservable } from '@angular/core/rxjs-interop';
  // public token$ = toObservable(this.tokenSignal);
  public isLoggedInSignal = computed(() => !!this.tokenSignal());
  public userRolesSignal = computed(() => this.decodeToken(this.tokenSignal())?.roles || []);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.post(API_ENDPOINTS.auth.login, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          this.tokenSignal.set(response.token);  // Update signal
        })
      );
  }

  // Signal version
  loginSignal(credentials: LoginRequest): Signal<LoginResponse | null> {
    const result = signal<LoginResponse | null>(null);
    this.login(credentials).subscribe(result.set.bind(result));
    return result.asReadonly();
  }

  hasRole(role: string): boolean {
    return this.userRolesSignal().includes(role);
  }

  private decodeToken(token: string | null): any {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
}