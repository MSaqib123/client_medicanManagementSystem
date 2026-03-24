import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BrandComponent } from './brand.component';
import { BrandRoutingModule } from './brand-routing.module';
import { BrandListComponent } from "./brand-list/brand-list.component";
import { BrandCreateUpdateComponent } from "./brand-create-update/brand-create-update.component";
import { BrandDeleteComponent } from "./brand-delete/brand-delete.component";
import { BrandDetailComponent } from "./brand-detail/brand-detail.component";
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  declarations: [
    BrandComponent,
    BrandListComponent,
    BrandCreateUpdateComponent,
    BrandDeleteComponent,
    BrandDetailComponent
  ],
  imports: [
    CommonModule,
    BrandRoutingModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    DatePipe,
    DataTablesModule
  ]
})
export class BrandModule {}