import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component'; // Your component with the dashboard HTML
// Import any shared modules or other dependencies (e.g., FormsModule if needed)

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    DashboardComponent,
  ]
})
export class DashboardModule { }