import { Component, signal, computed, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BrandService } from '../../../core/services/brand.service';
import { Brand, CreateBrand } from '../../../core/models';
import { APP_CONSTANTS } from '../../../core/constants/app.constants';
import { ValidationUtils } from '../../../core/utils/validation.utils';
declare var bootstrap: any;

/**
 * BrandListComponent - Signal-driven table with modals.
 * @description Handles CRUD via modals with local state updates for efficiency.
 * @example Uses client-side pagination, filtering, and sorting for generic logic.
 */
@Component({
  selector: 'app-brand-list',
  standalone: false,  // Module-based; imports moved to BrandModule
  templateUrl: './brand-list.component.html',
  styleUrls: ['./brand-list.component.css']
})
export class BrandListComponent {
  // Local signals
  brands = signal<Brand[]>([]);  // All brands (client-side cache)
  loading = signal<boolean>(false);
  error = signal<string>('');
  selectedBrand = signal<Brand | null>(null);  // For edit/delete
  isEditing = signal<boolean>(false);  // Toggle add/edit mode
  searchTerm = signal<string>('');  // For filtering
  statusFilter = signal<string | null>(null); // For status filtering
  sortBy = signal<'name' | 'createdAt'>('createdAt');
  sortDir = signal<'asc' | 'desc'>('desc');
  currentPage = signal<number>(1);
  pageSize = 10;

  // Computed signals
  filteredBrands = computed(() => {
    let data = [...this.brands()];

    // Apply search filter
    if (this.searchTerm()) {
      data = data.filter(brand => 
        brand.name.toLowerCase().includes(this.searchTerm().toLowerCase())
      );
    }

    // Apply status filter
    if (this.statusFilter()) {
      data = data.filter(brand => brand.status === this.statusFilter());
    }

    // Apply sorting
    data.sort((a, b) => {
      let comp = 0;
      if (this.sortBy() === 'name') {
        comp = a.name.localeCompare(b.name);
      } else if (this.sortBy() === 'createdAt') {
        comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return this.sortDir() === 'asc' ? comp : -comp;
    });

    return data;
  });

  paginatedBrands = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredBrands().slice(start, start + this.pageSize);
  });

  totalRecords = computed(() => this.filteredBrands().length);

  totalPages = computed(() => Math.ceil(this.totalRecords() / this.pageSize));

  pageArray = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  sortText = computed(() => {
    if (this.sortBy() === 'createdAt' && this.sortDir() === 'desc') return 'Latest';
    return this.sortDir() === 'asc' ? 'Ascending' : 'Descending';
  });

  selectAll = signal<boolean>(false);  // For checkboxes
  selectedRows = signal<Set<string>>(new Set());  // Track selected IDs

  // Form for add/edit
  addEditForm: FormGroup;

  // ViewChild for modals
  @ViewChild('addBrandModal') addBrandModal!: ElementRef;
  @ViewChild('editBrandModal') editBrandModal!: ElementRef;
  @ViewChild('deleteModal') deleteModal!: ElementRef;

  constructor(
    private brandSvc: BrandService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    // Init form
    this.addEditForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      status: ['active', Validators.required],
      imageUrl: ['', Validators.pattern(ValidationUtils.isValidUrl ? new RegExp(ValidationUtils.isValidUrl) : '')]  // Optional
    });

    // Initial load
    this.loadBrands();
  }

  /**
   * Load all brands (initial fetch).
   */
  loadBrands(): void {
    this.loading.set(true);
    this.error.set('');
    this.brandSvc.getBrands().subscribe({ 
      next: (brands: Brand[]) => {
        this.brands.set(brands);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set('Failed to load brands: ' + (err.message || 'Unknown error'));
        this.toastr.error(this.error());
      }
    });
  }

  /**
   * Toggle select all.
   */
  onSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectAll.set(checked);
    if (checked) {
      this.selectedRows.set(new Set(this.paginatedBrands().map(b => b.id)));
    } else {
      this.selectedRows.set(new Set());
    }
  }

  /**
   * Row checkbox select.
   * @param id Brand ID.
   * @param event Checkbox event.
   */
  onRowSelect(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedRows.update(set => {
      checked ? set.add(id) : set.delete(id);
      return new Set(set);
    });
    // Update selectAll if all checked
    this.selectAll.set(this.selectedRows().size === this.paginatedBrands().length);
  }

  /**
   * Open add modal.
   */
  openAddModal(): void {
    this.isEditing.set(false);
    this.addEditForm.reset({ status: 'active' });
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
      status: brand.status || 'active',
      imageUrl: brand.imageUrl || ''
    });
    const modal = new bootstrap.Modal(this.editBrandModal.nativeElement);
    modal.show();
  }

  /**
   * Submit form (add or edit with local update).
   */
  onSubmit(): void {
    if (this.addEditForm.invalid) {
      this.toastr.warning('Please fix form errors');
      return;
    }

    const payload: CreateBrand = this.addEditForm.value;
    this.loading.set(true);

    if (!this.isEditing()) {
      // Add
      this.brandSvc.create(payload).subscribe({
        next: (newBrand: Brand) => {
          this.brands.update(list => [...list, { ...newBrand, status: newBrand.status ?? 'active' }]);
          this.toastr.success('Brand added');
          this.closeModal('add-brand');
          this.loading.set(false);
        },
        error: (err) => {
          this.toastr.error(err.message || 'Operation failed');
          this.loading.set(false);
        }
      });
    } else {
      // Edit
      this.brandSvc.update(this.selectedBrand()!.id, payload).subscribe({
        next: (updated: Brand) => {
          this.brands.update(list => list.map(b => b.id === updated.id ? { ...updated, status: updated.status ?? 'active' } : b));
          this.toastr.success('Brand updated');
          this.closeModal('edit-brand');
          this.loading.set(false);
        },
        error: (err) => {
          this.toastr.error(err.message || 'Operation failed');
          this.loading.set(false);
        }
      });
    }
  }

  /**
   * Open delete modal.
   * @param brand Brand to delete.
   */
  openDeleteModal(brand: Brand): void {
    this.selectedBrand.set(brand);
    const modal = new bootstrap.Modal(this.deleteModal.nativeElement);
    modal.show();
  }

  /**
   * Confirm delete (with local update).
   */
  confirmDelete(): void {
    const id = this.selectedBrand()?.id;
    if (id) {
      this.loading.set(true);
      this.error.set('');
      this.brandSvc.deleteBrand(id).subscribe({
        next: () => {
          this.brands.update(brands => brands.filter(b => b.id !== id));
          this.toastr.success('Brand deleted');
          this.closeModal('delete-modal');
          this.loading.set(false);
        },
        error: (err: any) => {
          this.loading.set(false);
          this.toastr.error('Delete failed: ' + (err.message || 'Unknown'));
        }
      });
    }
  }

  /**
   * Search update.
   * @param term Search term.
   */
  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1); // Reset to first page on search
  }

  /**
   * Filter by status (update filter).
   * @param status 'active' | 'inactive' | 'all'.
   */
  onFilterStatus(status: string): void {
    this.statusFilter.set(status === 'all' ? null : status);
    this.currentPage.set(1); // Reset to first page on filter
    this.toastr.info(`Filtered by ${status === 'all' ? 'All' : status}`);
  }

  /**
   * Sort by field.
   * @param type 'latest' | 'asc' | 'desc'.
   */
  onSort(type: string): void {
    if (type === 'latest') {
      this.sortBy.set('createdAt');
      this.sortDir.set('desc');
    } else if (type === 'asc') {
      this.sortBy.set('name');
      this.sortDir.set('asc');
    } else if (type === 'desc') {
      this.sortBy.set('name');
      this.sortDir.set('desc');
    }
    this.currentPage.set(1); // Reset to first page on sort
    this.toastr.info(`Sorted by ${type}`);
  }

  /**
   * Export PDF (stub).
   */
  exportToPdf(): void {
    this.toastr.info('PDF exported');
  }

  /**
   * Export Excel (stub).
   */
  exportToExcel(): void {
    this.toastr.info('Excel exported');
  }

  /**
   * Refresh.
   */
  refresh(): void {
    this.loadBrands();
    this.toastr.info('Refreshed');
  }

  /**
   * Close modal.
   * @param modalId ID.
   */
  private closeModal(modalId: string): void {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    modal?.hide();
  }

  get isFormValid(): boolean { return this.addEditForm.valid; }
  get formErrors(): any { return this.addEditForm.errors; }
}