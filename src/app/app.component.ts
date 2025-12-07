import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppRoutingModule } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';
import { LayoutModule } from './layout/layout.module';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    LayoutModule   
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
