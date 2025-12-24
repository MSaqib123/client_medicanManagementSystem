import { NgModule } from "@angular/core";
import { CategoryComponent } from "./category.component";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule, DatePipe } from "@angular/common";
import { DataTablesModule } from "angular-datatables";
import { CategoryRoutingModule } from "./category-routing.module";



@NgModule({
    declarations:[
        CategoryComponent
    ],
    imports: [
        CommonModule,
        CategoryRoutingModule,
        ReactiveFormsModule,
        RouterLink,
        RouterLinkActive,
        DatePipe,
        DataTablesModule
    ]
})

export class CategoryModule{}