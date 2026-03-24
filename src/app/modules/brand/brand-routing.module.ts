import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrandComponent } from './brand.component';
import { BrandListComponent } from './brand-list/brand-list.component';

const routes: Routes = [
  {
    path: '', // Relative to parent (e.g., /brand)
    component: BrandComponent, // Container component (could have <router-outlet> for children)
    children: [
      { path: '', redirectTo: 'brand-list', pathMatch: 'full' }, // Default to list
      { path: 'brand-list', component: BrandListComponent },
      // { path: 'create', component: BrandCreateUpdateComponent },
      // { path: 'update/:id', component: BrandCreateUpdateComponent }, // Reuse for update with param
      // { path: 'detail/:id', component: BrandDetailComponent },
      // { path: 'delete/:id', component: BrandDeleteComponent } // If needed; else handle via service/modal
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // forChild, not forRoot
  exports: [RouterModule]
})
export class BrandRoutingModule {}