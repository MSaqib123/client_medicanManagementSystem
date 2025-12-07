import { AfterViewInit, Component, OnInit } from '@angular/core';
import {feather} from "feather-icons";
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HorizontalSidebarComponent } from './horizontal-sidebar/horizontal-sidebar.component';
import { TwoColSidebarComponent } from './two-col-sidebar/two-col-sidebar.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {

}
