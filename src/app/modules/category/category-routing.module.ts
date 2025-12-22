import { Component, NgModule } from "@angular/core";
import { Router, RouterModule, Routes } from "@angular/router";
import { CategoryComponent } from "./category.component";

const routes:Routes = [
    {
        path:'',
        component:CategoryComponent,
        children:[
            {path:'',redirectTo:'category-list',pathMatch:'full'},
            // {path:'category-list',component:CategoryComponent}
        ]
    }
]


@NgModule({
    imports:[RouterModule.forChild(routes)],
    exports:[RouterModule]
})

export class CategoryRoutingModule{}