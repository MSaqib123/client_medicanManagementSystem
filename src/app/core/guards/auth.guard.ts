// // core/guards/auth.guard.ts
// /**
//  * Auth Guard - Protects routes.
//  * @description Checks token; redirects on fail with returnUrl.
//  */
// import { Injectable } from '@angular/core';
// import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
// import { Observable } from 'rxjs';
// import { map, take } from 'rxjs/operators';
// import { AuthService } from './auth.service';

// @Injectable({ providedIn: 'root' })
// export class AuthGuard implements CanActivate {
//   constructor(private authSvc: AuthService, private router: Router) {}

//   canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
//     return this.authSvc.token$.pipe(
//       take(1),
//       map(token => !!token),
//       map(allowed => {
//         if (allowed) return true;
//         this.router.navigate(['/auth/login'], { queryParams: { returnUrl: route.url.join('/') } });
//         return false;
//       })
//     );
//   }
// }

