import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrandComponent } from './brand.component';
import { BrandListComponent } from './brand-list/brand-list.component';
import { CreateUpdateComponent } from './create-update/create-update.component';
import { DetailComponent } from './detail/detail.component';
import { DeleteComponent } from './delete/delete.component';
// import { ListComponent } from './list/list.component';
// import { CreateUpdateComponent } from './createupdate/createupdate.component';
// import { DetailComponent } from './detail/detail.component';
// import { DeleteComponent } from './delete/delete.component'; // Optional

const routes: Routes = [
  {
    path: '', // Relative to parent (e.g., /brand)
    component: BrandComponent, // Container component (could have <router-outlet> for children)
    children: [
      { path: '', redirectTo: 'brand-list', pathMatch: 'full' }, // Default to list
      { path: 'brand-list', component: BrandListComponent },
      { path: 'create', component: CreateUpdateComponent },
      { path: 'update/:id', component: CreateUpdateComponent }, // Reuse for update with param
      { path: 'detail/:id', component: DetailComponent },
      { path: 'delete/:id', component: DeleteComponent } // If needed; else handle via service/modal
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // forChild, not forRoot
  exports: [RouterModule]
})
export class BrandRoutingModule {}