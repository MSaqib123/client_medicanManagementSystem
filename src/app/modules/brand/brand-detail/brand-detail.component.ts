import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { Brand } from '../../../core/models';
declare var bootstrap: any;

@Component({
  selector: 'app-brand-detail',
  standalone: false,                    // ← FIXED
  templateUrl: './brand-detail.component.html'
})
export class BrandDetailComponent {
  selectedBrand = signal<Brand | null>(null);
  @ViewChild('detailModal') detailModal!: ElementRef;

  open(brand: Brand): void {
    this.selectedBrand.set(brand);
    const modal = new bootstrap.Modal(this.detailModal.nativeElement);
    modal.show();
  }
}