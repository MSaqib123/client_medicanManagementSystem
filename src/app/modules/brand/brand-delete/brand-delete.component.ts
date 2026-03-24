import { Component, signal, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BrandService } from '../../../core/services/brand.service';
import { Brand } from '../../../core/models';
declare var bootstrap: any;

@Component({
  selector: 'app-brand-delete',
  standalone: false,                    // ← FIXED
  templateUrl: './brand-delete.component.html'
})
export class BrandDeleteComponent {
  selectedBrand = signal<Brand | null>(null);
  @Output() brandDeleted = new EventEmitter<string>();
  @ViewChild('deleteModal') deleteModal!: ElementRef;

  constructor(
    private brandSvc: BrandService,
    private toastr: ToastrService
  ) {}

  open(brand: Brand): void {
    this.selectedBrand.set(brand);
    const modal = new bootstrap.Modal(this.deleteModal.nativeElement);
    modal.show();
  }

  confirmDelete(): void {
    const id = this.selectedBrand()?.id;
    if (id) {
      this.brandSvc.deleteBrand(id).subscribe({
        next: () => {
          this.brandDeleted.emit(id);
          this.toastr.success('Brand deleted successfully');
          this.closeModal();
        },
        error: (err: any) => {
          this.toastr.error('Delete failed: ' + (err.message || 'Unknown'));
        }
      });
    }
  }

  private closeModal(): void {
    const modal = bootstrap.Modal.getInstance(this.deleteModal.nativeElement);
    modal?.hide();
  }
}