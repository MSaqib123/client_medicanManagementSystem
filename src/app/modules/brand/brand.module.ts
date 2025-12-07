import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandComponent } from './brand.component';
import { BrandRoutingModule } from './brand-routing.module';
import { BrandListComponent } from "./brand-list/brand-list.component";
import { RouterLink, RouterLinkActive } from '@angular/router';


@NgModule({
  declarations: [
    BrandComponent,
    BrandListComponent,
    // ListComponent,
    // CreateUpdateComponent,
    // DetailComponent,
    // DeleteComponent
  ],
  imports: [
    CommonModule,
    BrandRoutingModule,
    RouterLink,
    RouterLinkActive
]
})
export class BrandModule { }
