// // core/core.module.ts
// /**
//  * Core Module - Singleton for app-wide services.
//  * @description Import once in AppModule. Provides HTTP, guards, interceptors.
//  * @forRoot For env injection if needed.
//  */
// import { NgModule, Optional, SkipSelf, ModuleWithProviders } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
// import { ToastrModule } from 'ngx-toastr';

// import { AuthInterceptor, ErrorInterceptor, LoadingInterceptor } from './interceptors';
// import { AuthGuard, RoleGuard } from './guards';
// import { BrandResolver } from './resolvers/brand.resolver';  // Example
// import { ApiService } from './services/api.service';
// import { AuthService, BrandService, /* Import all */ } from './services';
// import { ErrorHandlerService } from './error-handler/error-handler.service';
// import { LoadingService } from './services/loading.service';  // For spinner

// @NgModule({
//   imports: [
//     CommonModule,
//     HttpClientModule,
//     ToastrModule.forRoot({
//       timeOut: 3000,
//       positionClass: 'toast-top-right',
//       preventDuplicates: true
//     })
//   ],
//   providers: [
//     { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
//     { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
//     { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
//     AuthGuard,
//     RoleGuard,
//     BrandResolver,
//     ApiService,
//     AuthService,
//     BrandService,
//     // All services...
//     ErrorHandlerService,
//     LoadingService,
//     { provide: 'RETRY_COUNT', useValue: 3 }  // For ApiService DI
//   ]
// })
// export class CoreModule {
//   /**
//    * ForRoot guard - Prevent re-import.
//    */
//   static forRoot(): ModuleWithProviders<CoreModule> {
//     return {
//       ngModule: CoreModule,
//       providers: []  // Add env-specific if needed
//     };
//   }

//   constructor(@Optional() @SkipSelf() parentModule?: CoreModule) {
//     if (parentModule) {
//       throw new Error('CoreModule already loaded. Import only in AppModule.');
//     }
//   }
// }