
// // core/interceptors/error.interceptor.ts
// /**
//  * Error Interceptor - Global HTTP error handling.
//  * @description Maps status to user messages; logs to console/Sentry.
//  */
// import { Injectable } from '@angular/core';
// import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { ToastrService } from 'ngx-toastr';

// @Injectable()
// export class ErrorInterceptor implements HttpInterceptor {
//   constructor(private toastr: ToastrService) {}

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     return next.handle(req).pipe(
//       catchError((error: HttpErrorResponse) => {
//         const msg = this.getErrorMessage(error);
//         this.toastr.error(msg);
//         return throwError(() => error);
//       })
//     );
//   }

//   private getErrorMessage(error: HttpErrorResponse): string {
//     switch (error.status) {
//       case 0: return 'No internet connection';
//       case 401: return 'Session expired - logging out';
//       case 403: return 'Access denied';
//       case 404: return 'Resource not found';
//       case 500: return 'Server error - try later';
//       default: return error.error?.message || 'Unknown error';
//     }
//   }
// }

// // core/interceptors/error.interceptor.ts
// /**
//  * Error Interceptor - Global HTTP error handling.
//  * @description Maps status to user messages; logs to console/Sentry.
//  */
// import { Injectable } from '@angular/core';
// import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { ToastrService } from 'ngx-toastr';

// @Injectable()
// export class ErrorInterceptor implements HttpInterceptor {
//   constructor(private toastr: ToastrService) {}

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     return next.handle(req).pipe(
//       catchError((error: HttpErrorResponse) => {
//         const msg = this.getErrorMessage(error);
//         this.toastr.error(msg);
//         return throwError(() => error);
//       })
//     );
//   }

//   private getErrorMessage(error: HttpErrorResponse): string {
//     switch (error.status) {
//       case 0: return 'No internet connection';
//       case 401: return 'Session expired - logging out';
//       case 403: return 'Access denied';
//       case 404: return 'Resource not found';
//       case 500: return 'Server error - try later';
//       default: return error.error?.message || 'Unknown error';
//     }
//   }
// }
