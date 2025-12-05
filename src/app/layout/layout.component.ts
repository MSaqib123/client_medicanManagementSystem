import { Component } from '@angular/core';
import { SidebarComponent } from "./sidebar/sidebar.component";
import { HeaderComponent } from "./header/header.component";
import { RouterOutlet } from "@angular/router";
import { FooterComponent } from "./footer/footer.component";
import { HorizontalSidebarComponent } from "./horizontal-sidebar/horizontal-sidebar.component";
import { TwoColSidebarComponent } from "./two-col-sidebar/two-col-sidebar.component";
import { AddStockComponent } from "./add-stock/add-stock.component";

@Component({
  selector: 'app-layout',
  standalone: true,   // <--- IMPORTANT
  imports: [
    SidebarComponent,
    HeaderComponent,
    RouterOutlet,
    FooterComponent,
    HorizontalSidebarComponent,
    TwoColSidebarComponent,
    AddStockComponent
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {}
