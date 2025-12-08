// // core/resolvers/brand.resolver.ts
// /**
//  * Resolver - Pre-fetches data for route activation.
//  * @description Use in routing: resolve: { brands: BrandResolver }
//  */
// import { Injectable } from '@angular/core';
// import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
// import { Observable } from 'rxjs';
// import { BrandService } from '../services/brand.service';

// @Injectable({ providedIn: 'root' })
// export class BrandResolver implements Resolve<Brand[]> {
//   constructor(private brandSvc: BrandService) {}

//   resolve(route: ActivatedRouteSnapshot): Observable<Brand[]> {
//     const id = route.params['id'];
//     return id ? this.brandSvc.getById(id) : this.brandSvc.getBrands();
//   }
// }