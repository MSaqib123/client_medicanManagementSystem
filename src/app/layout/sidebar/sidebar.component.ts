import { AfterViewInit, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
declare var $: any;
declare var feather: any;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements AfterViewInit {

  ngAfterViewInit() {
    // Call feather.replace() if using feather icons
    if ((window as any).feather) {
      (window as any).feather.replace();
    }

    // Sidebar Initialization for submenus
    function init() {
      $('.sidebar-menu a').on('click', function(this: HTMLElement, e: any) {
        const $thisElem = $(this);
        if ($thisElem.parent().hasClass('submenu')) {
          e.preventDefault();
        }
        if (!$thisElem.hasClass('subdrop')) {
          $('ul', $thisElem.parents('ul:first')).slideUp(250);
          $('a', $thisElem.parents('ul:first')).removeClass('subdrop');
          $thisElem.next('ul').slideDown(350);
          $thisElem.addClass('subdrop');
        } else if ($thisElem.hasClass('subdrop')) {
          $thisElem.removeClass('subdrop');
          $thisElem.next('ul').slideUp(350);
        }
      });
      $('.sidebar-menu ul li.submenu a.active').parents('li:last').children('a:first').addClass('active').trigger('click');
    }

    init();

    // Toggle Button for Sidebar (mini-sidebar toggle)
    $(document).on('click', '#toggle_btn', function(this: HTMLElement) {
      const $thisElem = $(this);
      if ($('body').hasClass('mini-sidebar')) {
        $('body').removeClass('mini-sidebar');
        $thisElem.addClass('active');
        $('.subdrop + ul');  // Unused, but kept
        localStorage.setItem('screenModeNightTokenState', 'night');
        setTimeout(() => {
          $("body").removeClass("mini-sidebar");
          $(".sidebar-logo").addClass("active");
        }, 100);
      } else {
        $('body').addClass('mini-sidebar');
        $thisElem.removeClass('active');
        $('.subdrop + ul');  // Unused, but kept
        localStorage.removeItem('screenModeNightTokenState');
        setTimeout(() => {
          $("body").addClass("mini-sidebar");
          $(".sidebar-logo").removeClass("active");
        }, 100);
      }
      return false;
    });

    // Mouseover for mini-sidebar expansion
    $(document).on('mouseover', function(this: HTMLElement, e: any): boolean {
      e.stopPropagation();
      if ($('body').hasClass('mini-sidebar') && $('#toggle_btn').is(':visible')) {
        const targ = $(e.target).closest('.sidebar, .header-left').length;
        if (targ) {
          $('body').addClass('expand-menu');
          $('.subdrop + ul').slideDown();
        } else {
          $('body').removeClass('expand-menu');
          $('.subdrop + ul').slideUp();
        }
        return false;
      }
      return false;
    });

    // Variables declarations
    const $wrapper = $('.main-wrapper');
    const $slimScrolls = $('.slimscroll');
    const $pageWrapper = $('.page-wrapper');

    // Page Content Height Resize
    $(window).resize(() => {
      if ($('.page-wrapper').length > 0) {
        const height = $(window).height();
        $(".page-wrapper").css("min-height", height);
      }
    });

    // Mobile menu sidebar overlay
    $('body').append('<div class="sidebar-overlay"></div>');

    $(document).on('click', '#mobile_btn', function(this: HTMLElement) {
      $wrapper.toggleClass('slide-nav');
      $('.sidebar-overlay').toggleClass('opened');
      $('html').addClass('menu-opened');
      $('#task_window').removeClass('opened');
      return false;
    });

    $(".sidebar-overlay").on("click", function(this: HTMLElement) {
      $('html').removeClass('menu-opened');
      $(this).removeClass('opened');
      $wrapper.removeClass('slide-nav');
      $('.sidebar-overlay').removeClass('opened');
      $('#task_window').removeClass('opened');
    });

    // Logo Hide Btn
    $(document).on("click", ".hideset", function(this: HTMLElement) {
      $(this).parent().parent().parent().hide();
    });

    $(document).on("click", ".delete-set", function(this: HTMLElement) {
      $(this).parent().parent().hide();
    });

    // Stick Sidebar
    if ($(window).width() > 767) {
      if ($('.theiaStickySidebar').length > 0) {
        $('.theiaStickySidebar').theiaStickySidebar({
          additionalMarginTop: 30
        });
      }
    }

    // Toggle Password
    if ($('.toggle-password').length > 0) {
      $(document).on('click', '.toggle-password', function(this: HTMLElement) {
        const $thisElem = $(this);
        $thisElem.toggleClass("fa-eye fa-eye-slash");
        const input = $(".pass-input");
        if (input.attr("type") === "password") {
          input.attr("type", "text");
        } else {
          input.attr("type", "password");
        }
      });
    }

    if ($('.toggle-passwords').length > 0) {
      $(document).on('click', '.toggle-passwords', function(this: HTMLElement) {
        const $thisElem = $(this);
        $thisElem.toggleClass("fa-eye fa-eye-slash");
        const input = $(".pass-inputs");
        if (input.attr("type") === "password") {
          input.attr("type", "text");
        } else {
          input.attr("type", "password");
        }
      });
    }

    if ($('.toggle-passworda').length > 0) {
      $(document).on('click', '.toggle-passworda', function(this: HTMLElement) {
        const $thisElem = $(this);
        $thisElem.toggleClass("fa-eye fa-eye-slash");
        const input = $(".pass-inputa");
        if (input.attr("type") === "password") {
          input.attr("type", "text");
        } else {
          input.attr("type", "password");
        }
      });
    }

    // Settings Toggle Password
    if ($('.toggle-password').length > 0) {
      $(document).on('click', '.toggle-password', function(this: HTMLElement) {
        const $thisElem = $(this);
        $thisElem.toggleClass("ti-eye ti-eye-off");
        const input = $(".settings-pass-input");
        if (input.attr("type") === "password") {
          input.attr("type", "text");
        } else {
          input.attr("type", "password");
        }
      });
    }

    if ($('.toggle-passwords').length > 0) {
      $(document).on('click', '.toggle-passwords', function(this: HTMLElement) {
        const $thisElem = $(this);
        $thisElem.toggleClass("ti-eye ti-eye-off");
        const input = $(".settings-pass-inputs");
        if (input.attr("type") === "password") {
          input.attr("type", "text");
        } else {
          input.attr("type", "password");
        }
      });
    }

    if ($('.toggle-passworda').length > 0) {
      $(document).on('click', '.toggle-passworda', function(this: HTMLElement) {
        const $thisElem = $(this);
        $thisElem.toggleClass("ti-eye ti-eye-off");
        const input = $(".settings-pass-inputa");
        if (input.attr("type") === "password") {
          input.attr("type", "text");
        } else {
          input.attr("type", "password");
        }
      });
    }

    // Sidebar Slimscroll (assuming jquery.slimscroll is installed and declared)
    if ($slimScrolls.length > 0) {
      $slimScrolls.slimScroll({
        height: 'auto',
        width: '100%',
        position: 'right',
        size: '7px',
        color: '#ccc',
        wheelStep: 10,
        touchScrollStep: 100
      });
      const wHeight = $(window).height()! - 60;
      $slimScrolls.height(wHeight);
      $('.sidebar .slimScrollDiv').height(wHeight);
      $(window).resize(() => {
        const rHeight = $(window).height()! - 60;
        $slimScrolls.height(rHeight);
        $('.sidebar .slimScrollDiv').height(rHeight);
      });
    }

    // Right sidebar if present
    function colinit() {
      $('.sidebar-right ul a').on('click', function(this: HTMLElement, e: any) {
        const $thisElem = $(this);
        if ($thisElem.parent().hasClass('submenu')) {
          e.preventDefault();
        }
        if (!$thisElem.hasClass('subdrop')) {
          $('ul', $thisElem.parents('ul:first')).slideUp(250);
          $('a', $thisElem.parents('ul:first')).removeClass('subdrop');
          $thisElem.next('ul').slideDown(350);
          $thisElem.addClass('subdrop');
        } else if ($thisElem.hasClass('subdrop')) {
          $thisElem.removeClass('subdrop');
          $thisElem.next('ul').slideUp(350);
        }
      });
      $('.sidebar-right ul li.submenu a.active').parents('li:last').children('a:first').addClass('active').trigger('click');
    }

    colinit();
  }
}