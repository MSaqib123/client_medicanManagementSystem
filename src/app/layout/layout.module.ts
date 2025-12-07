import { CommonModule } from "@angular/common";
import { FooterComponent } from "./footer/footer.component";
import { HeaderComponent } from "./header/header.component";
import { LayoutComponent } from "./layout.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { RouterLink, RouterModule ,RouterOutlet} from "@angular/router";
import { NgModule } from "@angular/core";
import { HorizontalSidebarComponent } from "./horizontal-sidebar/horizontal-sidebar.component";
import { TwoColSidebarComponent } from "./two-col-sidebar/two-col-sidebar.component";

@NgModule({
  declarations: [
    LayoutComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    HorizontalSidebarComponent,
    TwoColSidebarComponent,
    FooterComponent
],
  exports: [LayoutComponent]
})
export class LayoutModule {}



/*
🚩 When do we create a Module?

jab project bada ho
folder ko organize karna ho
multiple components ek hi module me hon
Lazy loading karni ho

So module is collection of:
Components
Pipes
Directives


🎯 declarations[] — Kisko Module OWN karega?
Module ke andar jo components BANAYE hain → woh declarations me aate hain.

🎯 imports[] — Kisko Module USE karega?
Module ke andar jo components BAHAR SE LAKE AAYE hain → woh imports me aate hain.

🎯 exports[] — Kisko Module SHARE karega?
Module ke andar jo components BAHAR DEKHAANA CHAHTA hai → woh exports me aate hain.


standlone: true  → iska matlab hai ki yeh component apne aap me ek module hai.
standlone: false → iska matlab hai ki yeh component kisi module ka hissa hai.
  
*/

