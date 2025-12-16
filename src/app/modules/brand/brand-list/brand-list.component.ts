
import { Component, signal, computed, effect, ChangeDetectorRef, ViewChild, ElementRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BrandService } from '../../../core/services/brand.service';
import { Brand, CreateBrand } from '../../../core/models';
import { APP_CONSTANTS } from '../../../core/constants/app.constants';
import { DateUtils } from '../../../core/utils/date.utils';
import { ValidationUtils } from '../../../core/utils/validation.utils';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
declare var bootstrap: any;

/**
 * BrandListComponent - Signal-driven table with modals.
 * @description Uses BrandService signals for reactive list. Handles CRUD via modals.
 * @example Brands update auto-refreshes table via effect.
 */
@Component({
  selector: 'app-brand-list',
  standalone: false,  // Module-based; imports moved to BrandModule
  templateUrl: './brand-list.component.html',
  styleUrls: ['./brand-list.component.css']
})
export class BrandListComponent {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();  // For re-rendering

  private brandSvc = inject(BrandService);

  // Signals from service (reactive)
  brands = signal<Brand[]>([]);  // Signal<Brand[]>
  loading = signal<boolean>(false);  // Local loading (sync with service)
  error = signal<string>('');  // Signal<string> (avoid null issues)

  // Local signals
  selectedBrand = signal<Brand | null>(null);  // For edit/delete
  isEditing = signal<boolean>(false);  // Toggle add/edit mode
  searchTerm = signal<string>('');  // For filtering
  filteredBrands = computed(() => 
    this.brands().filter(brand => 
      brand.name.toLowerCase().includes(this.searchTerm().toLowerCase())
    )
  );
  totalRecords = computed(() => this.brands().length);
  selectAll = signal<boolean>(false);  // For checkboxes
  selectedRows = signal<Set<string>>(new Set());  // Track selected IDs

  // Form for add/edit
  addEditForm: FormGroup;

  // ViewChild for modals
  @ViewChild('addBrandModal') addBrandModal!: ElementRef;
  @ViewChild('editBrandModal') editBrandModal!: ElementRef;
  @ViewChild('deleteModal') deleteModal!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,  // Customize as needed
      processing: true,
      order: [[1, 'asc']]  // Sort by Brand column
    };
    // Sync local signals with service
    effect(() => {
      this.brands.set(this.brandSvc.brandsSignal());
      this.loading.set(this.brandSvc.loading());
      this.error.set(this.brandSvc.error() || '');
      this.cdr.markForCheck();  // Ensure UI updates
    });

    // Init form
    this.addEditForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      status: ['Active', Validators.required],
      imageUrl: ['', Validators.pattern(ValidationUtils.isValidUrl ? new RegExp(ValidationUtils.isValidUrl) : '')]  // Optional
    });

    // Effect: Auto-filter and refetch on search change
    effect(() => {
      const term = this.searchTerm();
      this.brandSvc.search(term);
    });

    // Initial load
    this.loadBrands();
  }

  /**
   * Load brands (handles loading/error).
   */
  // loadBrands(): void {
  //   this.loading.set(true);
  //   this.error.set('');
  //   this.brandSvc.getBrands({ page: 1 }).subscribe({ 
  //     next: (brands: Brand[]) => {
  //       console.log(brands);  // This should show the 2 records
  //       this.brands.set(brands);  // Store data locally

  //       // Fixed computed: Filter returns boolean
  //       this.filteredBrands = computed(() => this.brands().filter(b => {
  //         console.log(b);  // Logs each brand during computation
  //         const search = this.searchTerm().toLowerCase();
  //         return !search || b.name.toLowerCase().includes(search);  // Include all if no search, else filter by name
  //       }));

  //       console.log(this.filteredBrands(), "abc");  // Log the computed VALUE (array)
  //       console.log(this.brands(), "def");  // Log the original brands array
  //       //this.loading.set(false);
  //     },
  //     error: (err: any) => {
  //       this.loading.set(false);
  //       this.error.set('Failed to load brands: ' + (err.message || 'Unknown error'));
  //       this.toastr.error(this.error());
  //     }
  //   });
  // }

  loadBrands(): void {
    this.loading.set(true);
    this.error.set('');
    this.brandSvc.getBrands({ page: 1 }).subscribe({ 
      next: (brands: Brand[]) => {
        console.log(brands);  // This should show the 2 records
        this.brands.set(brands);  // Store data locally

        console.log(this.filteredBrands(), "abc");  // Log the computed VALUE (array)
        console.log(this.brands(), "def");  // Log the original brands array
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
      this.selectedRows.set(new Set(this.brands().map(b => b.id)));
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
    this.selectAll.set(this.selectedRows().size === this.brands().length);
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
   * Submit form.
   */
  onSubmit(): void {
    if (this.addEditForm.invalid) {
      this.toastr.warning('Please fix form errors');
      return;
    }

    const payload: CreateBrand = this.addEditForm.value;
    this.loading.set(true);
    this.error.set('');

    if (this.isEditing()) {
      const id = this.selectedBrand()?.id;
      if (id) {
        this.brandSvc.update(id, payload).subscribe({
          next: () => {
            this.loading.set(false);
            this.toastr.success('Brand updated');
            this.closeModal('edit-brand');
            this.brandSvc.invalidateCache();  // Refetch
          },
          error: (err: any) => {
            this.loading.set(false);
            this.toastr.error('Update failed: ' + (err.message || 'Unknown'));
          }
        });
      }
    } else {
      this.brandSvc.create(payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.toastr.success('Brand added');
          this.closeModal('add-brand');
          this.brandSvc.invalidateCache();
        },
        error: (err: any) => {
          this.loading.set(false);
          this.toastr.error('Add failed: ' + (err.message || 'Unknown'));
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
   * Confirm delete.
   */
  confirmDelete(): void {
    const id = this.selectedBrand()?.id;
    if (id) {
      this.loading.set(true);
      this.error.set('');
      this.brandSvc.delete(id).subscribe({
        next: () => {
          this.loading.set(false);
          this.toastr.success('Brand deleted');
          this.closeModal('delete-modal');
          this.brandSvc.invalidateCache();
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
  }

  /**
   * Filter by status (update filter).
   * @param status 'Active' | 'Inactive'.
   */
  onFilterStatus(status: string): void {
    // Local filter example
    this.filteredBrands = computed(() => this.brands().filter(b => b.status === status));
    this.toastr.info(`Filtered by ${status}`);
  }

  /**
   * Sort by field.
   * @param field Sort field.
   */
  onSort(field: 'name' | 'createdAt' | 'status'): void {
    // Local sort
    this.brands.update(brands => [...brands].sort((a, b) => {
      if (field === 'name') return a.name.localeCompare(b.name);
      if (field === 'createdAt') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (field === 'status') return (a.status || '').localeCompare(b.status || '');
      return 0;
    }));
    this.toastr.info(`Sorted by ${field}`);
  }

  /**
   * Export PDF (stub).
   */
  exportToPdf(): void {
    console.log('PDF Export:', this.brands());
    this.toastr.info('PDF exported');
  }

  /**
   * Export Excel (stub).
   */
  exportToExcel(): void {
    console.log('Excel Export:', this.brands());
    this.toastr.info('Excel exported');
  }

  /**
   * Refresh.
   */
  refresh(): void {
    this.brandSvc.invalidateCache();
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



















