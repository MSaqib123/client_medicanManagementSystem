import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
declare var bootstrap: any;


@Component({
  selector: 'app-brand-list',
  standalone: false, // Add this; module-based
  // imports: [],
  templateUrl: './brand-list.component.html',
  styleUrl: './brand-list.component.css'
})
export class BrandListComponent {
   openAddModal() {
    const modalEl = document.getElementById("add-brand");
    console.log()
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  openEditModal() {
    const modalEl = document.getElementById("edit-brand");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}
