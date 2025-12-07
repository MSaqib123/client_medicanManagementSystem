import { DashboardComponent } from "./dashboard.component";
import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";

const routes:Routes=[
    {
        path:'',
        component:DashboardComponent,
        children:[
            {path:'',redirectTo:'dashboard',pathMatch:'full'}
        ]
    }
]

@NgModule({
    imports:[RouterModule.forChild(routes)],
    exports:[RouterModule]
})

export class DashboardRoutingModule{}   