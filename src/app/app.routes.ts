// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { LayoutComponent } from './layout/layout.component'; // Adjust path based on your structure (e.g., ../layout/layout.component)
// import { DashboardComponent } from './modules/dashboard/dashboard.component';
// import { BrandComponent } from './modules/brand/brand.component';

// export const routes: Routes = [
//   {
//     path: '',
//     component: LayoutComponent,
//     children: [
//       { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//       { path: 'dashboard', component: DashboardComponent },
//       { path: 'brand', component: BrandComponent }
//     ]
//   }
// ];

// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule]
// })
// export class AppRoutingModule {}


import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component'; // Adjust path

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      // Lazy-load modules here
      {
        path: 'dashboard',
        loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'brand',
        loadChildren: () => import('./modules/brand/brand.module').then(m => m.BrandModule)
      },
      // Add similar for inventory, products, sales, etc.
      // Example global route (if needed, e.g., a shared settings page)
      // {
      //   path: 'global-settings',
      //   loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule)
      // },

      // Wildcard for 404 (global)
      { path: '**', redirectTo: 'dashboard' }
    ]
  },
  // Non-layout routes (e.g., auth pages outside the layout)
  // { path: 'login', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}