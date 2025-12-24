import { NgModule } from "@angular/core";
import { SubcategoryComponent } from "./subcategory.component";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { CommonModule, DatePipe } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { DataTablesModule } from "angular-datatables";
import { SubcategoryRoutingModule } from "./subcategory-routing.module";

@NgModule({
  declarations:[SubcategoryComponent],
  imports: [
    RouterOutlet,
  CommonModule,
  SubcategoryRoutingModule,
          ReactiveFormsModule,
          RouterLink,
          RouterLinkActive,
          DatePipe,
          DataTablesModule
  
  ]
})

export class SubCategoryModule{}