// // core/interceptors/loading.interceptor.ts
// /**
//  * Loading Interceptor - Toggles global spinner.
//  */
// import { Injectable } from '@angular/core';
// import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { finalize } from 'rxjs/operators';
// import { LoadingService } from './loading.service';  // Simple BehaviorSubject<boolean>

// @Injectable()
// export class LoadingInterceptor implements HttpInterceptor {
//   constructor(private loadingSvc: LoadingService) {}

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     this.loadingSvc.setLoading(true, req.url);
//     return next.handle(req).pipe(
//       finalize(() => this.loadingSvc.setLoading(false, req.url))
//     );
//   }
// }