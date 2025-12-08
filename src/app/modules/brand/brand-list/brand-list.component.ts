// brand-list.component.ts (Updated with Signal Support)
import { Component, signal, computed, effect, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule,FormsModule } from '@angular/forms';  // For advanced forms
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';  // For @for, etc.
import { ToastrService } from 'ngx-toastr';  // For notifications
import { BrandService } from '../../../core/services/brand.service';
import { Brand, CreateBrand } from '../../../core/models';
import { APP_CONSTANTS } from '../../../core/constants/app.constants';
import { DateUtils } from '../../../core/utils/date.utils';
import { ValidationUtils } from '../../../core/utils/validation.utils';
declare var bootstrap: any;

/**
 * BrandListComponent - Signal-driven table with modals.
 * @description Uses BrandService signals for reactive list. Handles CRUD via modals.
 * @example Brands update auto-refreshes table via effect.
 */
@Component({
  selector: 'app-brand-list',
  standalone: false,  // Module-based; import ReactiveFormsModule in BrandModule
  templateUrl: './brand-list.component.html',
  styleUrls: ['./brand-list.component.css']  // Fixed plural
})
export class BrandListComponent {
APP_CONSTANTS: any;
DateUtils: any;
onRowSelect(arg0: any,$event: Event) {
throw new Error('Method not implemented.');
}
onFilterStatus(arg0: string) {
throw new Error('Method not implemented.');
}
  // Signals from service (reactive)
  brands = signal<Brand[]>([]);  // Signal<Brand[]>
  loading = signal<boolean>(false);  // Signal<boolean>
  error = signal<string | null>(null);  // Signal<string | null>

  // Local signals
  selectedBrand = signal<Brand | null>(null);  // For edit
  isEditing = signal<boolean>(false);  // Toggle add/edit mode
  searchTerm = signal<string>('');  // For filtering (computed)
  filteredBrands!: ReturnType<typeof computed>;
  totalRecords!: ReturnType<typeof computed>;
  selectAll = signal<boolean>(false);  // For checkboxes

  // Forms (Reactive for validation)
  addEditForm: FormGroup;

  // ViewChild for modals (Bootstrap integration)
  @ViewChild('addBrandModal', { static: false }) addBrandModal!: ElementRef;
  @ViewChild('editBrandModal', { static: false }) editBrandModal!: ElementRef;
  @ViewChild('deleteModal', { static: false }) deleteModal!: ElementRef;

  constructor(
    private brandSvc: BrandService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    // Init signals from service after brandSvc is initialized
    effect(() => {
      this.brands.set(this.brandSvc.brandsSignal());
      this.loading.set(this.brandSvc.loading());
      this.error.set(this.brandSvc.error());
    });

    // Init computed signals
    this.filteredBrands = computed(() => 
      this.brands().filter(brand => 
        brand.name.toLowerCase().includes(this.searchTerm().toLowerCase())
      )
    );
    this.totalRecords = computed(() => this.brands().length);

    // Init form
    this.addEditForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      status: ['Active', Validators.required],
      imageUrl: ['', Validators.pattern(ValidationUtils.isValidUrl ? new RegExp(ValidationUtils.isValidUrl) : '')]  // Optional image
    });

    // Effect: Auto-mark for check on signal changes (for OnPush if used)
    effect(() => {
      if (this.brands() || this.loading() || this.error()) {
        this.cdr.markForCheck();
      }
    });

    // Effect: Auto-filter on search change
    effect(() => {
      const term = this.searchTerm();
      this.brandSvc.search(term);  // Trigger service search
    });

    // Load initial data
    this.loadBrands();
  }

  /**
   * Load brands (triggers service fetch).
   */
  loadBrands(): void {
    this.brandSvc.getBrands({ page: 1 }).subscribe({
      error: err => this.toastr.error('Failed to load brands')
    });
  }

  /**
   * Toggle select all checkboxes.
   */
  onSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectAll.set(checked);
    // In real: Loop brands() and set selected property if added to model
  }

  /**
   * Open add modal.
   */
  openAddModal(): void {
    this.isEditing.set(false);
    this.addEditForm.reset({ status: 'Active' });
    const modal = new bootstrap.Modal(this.addBrandModal.nativeElement);
    modal.show();
  }

  /**
   * Open edit modal.
   * @param brand Brand to edit.
   */
  openEditModal(brand: Brand): void {
    this.isEditing.set(true);
    this.selectedBrand.set(brand);
    this.addEditForm.patchValue({
      name: brand.name,
      status: brand.status || 'Active',
      imageUrl: brand.imageUrl || ''
    });
    const modal = new bootstrap.Modal(this.editBrandModal.nativeElement);
    modal.show();
  }

  /**
   * Submit add/edit form.
   */
  onSubmit(): void {
    if (this.addEditForm.invalid) {
      this.toastr.warning('Please fix form errors');
      return;
    }

    const formValue = this.addEditForm.value;
    const payload: CreateBrand = {
      name: formValue.name,
      status: formValue.status, // Assume model has status
      imageUrl: formValue.imageUrl,
      createdByUserId: ''
    };

    if (this.isEditing()) {
      // Update
      const id = this.selectedBrand()?.id;
      if (id) {
        this.brandSvc.update(id, payload)
        // .subscribe({
        //   next: () => {
        //     this.toastr.success('Brand updated');
        //     this.closeModal('edit-brand');
        //     this.loadBrands();  // Refetch
        //   },
        //   error: () => this.toastr.error('Update failed')
        // });
      }
    } else {
      // Create
      this.brandSvc.create(payload).subscribe({
        next: (newBrand) => {
          this.toastr.success('Brand added');
          this.closeModal('add-brand');
          this.loadBrands();  // Auto-refetch via effect
        },
        error: () => this.toastr.error('Add failed')
      });
    }
  }

  /**
   * Delete brand.
   * @param brand Brand to delete.
   */
  openDeleteModal(brand: Brand): void {
    this.selectedBrand.set(brand);
    const modal = new bootstrap.Modal(this.deleteModal.nativeElement);
    modal.show();
  }

  confirmDelete(): void {
    const id = this.selectedBrand()?.id;
    if (id) {
      this.brandSvc.delete(id)
      // .subscribe({
      //   next: () => {
      //     this.toastr.success('Brand deleted');
      //     this.closeModal('delete-modal');
      //     this.loadBrands();
      //   },
      //   error: () => this.toastr.error('Delete failed')
      // });
    }
  }

  /**
   * Search brands.
   * @param term Search input.
   */
  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  /**
   * Sort by status/date (update service params).
   * @param sortBy 'name' | 'date' | 'status'.
   */
  onSort(sortBy: 'name' | 'createdAt' | 'status'): void {
    // Trigger service sort (assume service has sort method)
    this.brandSvc.getBrands({ page: 1, pageSize: 10 }).subscribe();
    // TODO: Implement sort in BrandService if needed
  }

  /**
   * Export to PDF/Excel (placeholder - integrate jsPDF or ExcelJS).
   */
  exportToPdf(): void {
    // Advanced: Use brands() signal for data
    console.log('Export PDF:', this.brands());
    this.toastr.info('PDF export triggered');
  }

  exportToExcel(): void {
    console.log('Export Excel:', this.brands());
    this.toastr.info('Excel export triggered');
  }

  /**
   * Refresh table.
   */
  refresh(): void {
    this.loadBrands();
    this.toastr.info('Refreshed');
  }

  /**
   * Close modal helper.
   * @param modalId Bootstrap modal ID.
   */
  private closeModal(modalId: string): void {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    modal?.hide();
  }

  // Getters for template (signal-friendly)
  get isFormValid(): boolean { return this.addEditForm.valid; }
  get formErrors(): any { return this.addEditForm.errors; }
}