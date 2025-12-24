import { NgModel } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { SubcategoryComponent } from "./subcategory.component";
import { NgModule } from "@angular/core";

const routes: Routes = [
    {
        path: '',   
        component: SubcategoryComponent,
        children: [
            {path:'',redirectTo:'subcategory-list',pathMatch:'full'},
        ]
    }
]
@NgModule({
    imports:[RouterModule.forChild(routes)],
    exports:[RouterModule]
})

export class SubcategoryRoutingModule{}