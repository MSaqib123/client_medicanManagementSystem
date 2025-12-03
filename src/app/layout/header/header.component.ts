


import { Component, AfterViewInit } from '@angular/core';
declare var $: any;
declare var feather: any;
@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements AfterViewInit {

  ngAfterViewInit(): void {

    setTimeout(() => {

      // Feather icons
      if (typeof feather !== 'undefined') {
        feather.replace();
      }

      // Bootstrap Dropdown
      $('[data-bs-toggle="dropdown"]').dropdown();

      // Mobile Sidebar Toggle
      $('#mobile_btn').on('click', function () {
        $('.sidebar').toggleClass('slide-nav');
        $('.page-wrapper').toggleClass('slide-nav-toggle');
      });

    }, 300);  // wait for HTML + JS load
  }
}

