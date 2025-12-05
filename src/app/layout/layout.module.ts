import { CommonModule } from "@angular/common";
import { FooterComponent } from "./footer/footer.component";
import { HeaderComponent } from "./header/header.component";
import { LayoutComponent } from "./layout.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";

@NgModule({
  declarations: [
    LayoutComponent,   // <-- MUST BE HERE
    SidebarComponent,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [LayoutComponent]
})
export class LayoutModule {}
