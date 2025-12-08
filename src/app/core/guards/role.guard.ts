// // core/guards/role.guard.ts
// /**
//  * Role Guard - For policies like AdminOnly.
//  */
// import { Injectable } from '@angular/core';
// import { CanActivate, Router } from '@angular/router';
// import { AuthService } from './auth.service';

// @Injectable({ providedIn: 'root' })
// export class RoleGuard implements CanActivate {
//   constructor(private authSvc: AuthService, private router: Router) {}

//   canActivate(): boolean {
//     if (!this.authSvc.hasRole('Admin')) {  // From auth service
//       this.router.navigate(['/unauthorized']);
//       return false;
//     }
//     return true;
//   }
// }