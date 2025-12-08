// import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';

// import { routes } from './app.routes';

// export const appConfig: ApplicationConfig = {
//   providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
// };




// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom,provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';  // Import here
// import { BrowserAnimationsModule } from '@angular/animations';  // For toastr animations (if enabled)
import { routes } from './app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    importProvidersFrom(
      // BrowserAnimationsModule,  // Enables animations (required for toastr effects)
      BrowserAnimationsModule,
      ToastrModule.forRoot({     // Your config here
        timeOut: 3000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
        progressBar: true,        // Optional: Animation bar
        closeButton: true         // Optional: X button
      })
    )
  ]
};