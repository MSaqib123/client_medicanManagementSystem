import { Component, signal, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BrandService } from '../../../core/services/brand.service';
import { Brand, CreateBrand } from '../../../core/models';
import { ValidationUtils } from '../../../core/utils/validation.utils';
declare var bootstrap: any;

@Component({
  selector: 'app-brand-create-update',
  standalone: false,                    // ← FIXED
  templateUrl: './brand-create-update.component.html',
  styleUrl: './brand-create-update.component.css'
})
export class BrandCreateUpdateComponent {
  addEditForm: FormGroup;
  isEditing = signal<boolean>(false);
  selectedBrand = signal<Brand | null>(null);
  submitting = signal<boolean>(false);

  @Output() brandAdded = new EventEmitter<Brand>();
  @Output() brandUpdated = new EventEmitter<Brand>();

  @ViewChild('brandModal') brandModal!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private brandSvc: BrandService,
    private toastr: ToastrService
  ) {
    this.addEditForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      status: ['active', Validators.required],
      imageUrl: ['', Validators.pattern(ValidationUtils.isValidUrl ? new RegExp(ValidationUtils.isValidUrl) : '')]
    });
  }

  openAdd(): void {
    this.isEditing.set(false);
    this.selectedBrand.set(null);
    this.addEditForm.reset({ status: 'active' });
    const modal = new bootstrap.Modal(this.brandModal.nativeElement);
    modal.show();
  }

  openEdit(brand: Brand): void {
    this.isEditing.set(true);
    this.selectedBrand.set(brand);
    this.addEditForm.patchValue({
      name: brand.name,
      status: brand.status || 'active',
      imageUrl: brand.imageUrl || ''
    });
    const modal = new bootstrap.Modal(this.brandModal.nativeElement);
    modal.show();
  }

  onSubmit(): void {
    if (this.addEditForm.invalid) {
      this.toastr.warning('Please fix form errors');
      return;
    }

    const payload: CreateBrand = this.addEditForm.value;
    this.submitting.set(true);

    if (!this.isEditing()) {
      this.brandSvc.create(payload).subscribe({
        next: (newBrand: Brand) => {
          this.brandAdded.emit(newBrand);
          this.toastr.success('Brand added successfully');
          this.closeModal();
          this.submitting.set(false);
        },
        error: (err) => {
          this.toastr.error(err.message || 'Failed to add brand');
          this.submitting.set(false);
        }
      });
    } else {
      const id = this.selectedBrand()!.id;
      this.brandSvc.update(id, payload).subscribe({
        next: (updated: Brand) => {
          this.brandUpdated.emit(updated);
          this.toastr.success('Brand updated successfully');
          this.closeModal();
          this.submitting.set(false);
        },
        error: (err) => {
          this.toastr.error(err.message || 'Failed to update brand');
          this.submitting.set(false);
        }
      });
    }
  }

  private closeModal(): void {
    const modal = bootstrap.Modal.getInstance(this.brandModal.nativeElement);
    modal?.hide();
  }

  get isFormValid(): boolean {
    return this.addEditForm.valid;
  }
}