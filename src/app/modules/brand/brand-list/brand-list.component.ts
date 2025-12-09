// import { Component } from '@angular/core';
// import { RouterLink, RouterLinkActive } from '@angular/router';
// import { ToastrService } from 'ngx-toastr';
// declare var bootstrap: any;


// @Component({
//   selector: 'app-brand-list',
//   standalone: false, // Add this; module-based
//   // imports: [],
//   templateUrl: './brand-list.component.html',
//   styleUrl: './brand-list.component.css'
// })
// export class BrandListComponent {
//   constructor(private toastr: ToastrService) {}
//    openAddModal() {
//     const modalEl = document.getElementById("add-brand");
//     console.log()
//     const modal = new bootstrap.Modal(modalEl);
//     modal.show();
//   }

//   openEditModal() {
//     const modalEl = document.getElementById("edit-brand");
//     const modal = new bootstrap.Modal(modalEl);
//     modal.show();
//   }

//   public Save(){
//     this.toastr.success('Brand added successfully!');
    
//   }
// }



// brand-list.component.ts (Fixed: No Imports on Non-Standalone, Typed Err, Public Invalidate, Loading on All Ops)
import { Component, signal, computed, effect, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
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
  standalone: false,  // Module-based; imports moved to BrandModule
  templateUrl: './brand-list.component.html',
  styleUrls: ['./brand-list.component.css']
})
export class BrandListComponent {
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
    private brandSvc: BrandService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
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
  loadBrands(): void {
    this.loading.set(true);
    this.error.set('');
    this.brandSvc.getBrands({ page: 1 }).subscribe({
      next: () => this.loading.set(false),  // Success: Stop loading
      error: (err: any) => {
        this.loading.set(false);  // Error: Stop spinner
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









































/*
<!-- brand-list.component.html (Updated with Signals & Reactive Binding) -->
<div class="page-header">
  <div class="add-item d-flex">
    <div class="page-title">
      <h4 class="fw-bold">Brand</h4>
      <h6>Manage your brands</h6>
    </div>
  </div>
  <ul class="table-top-head">
    <li>
      <a data-bs-toggle="tooltip" data-bs-placement="top" title="Pdf" (click)="exportToPdf()">
        <img src="assets/img/icons/pdf.svg" alt="img">
      </a>
    </li>
    <li>
      <a data-bs-toggle="tooltip" data-bs-placement="top" title="Excel" (click)="exportToExcel()">
        <img src="assets/img/icons/excel.svg" alt="img">
      </a>
    </li>
    <li>
      <a data-bs-toggle="tooltip" data-bs-placement="top" title="Refresh" (click)="refresh()">
        <i class="ti ti-refresh"></i>
      </a>
    </li>
    <li>
      <a data-bs-toggle="tooltip" data-bs-placement="top" title="Collapse" id="collapse-header">
        <i class="ti ti-chevron-up"></i>
      </a>
    </li>
  </ul>
  <div class="page-btn">
    <a href="#" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-brand" (click)="openAddModal()">
      <i class="ti ti-circle-plus me-1"></i>Add Brand
    </a>
  </div>
</div>

<!-- Table with Signal Binding -->
<div class="card">
  <div class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
    <div class="search-set">
      <!-- Search Input (binds to signal) -->
      <div class="search-input">
        <span class="btn-searchset"><i class="ti ti-search fs-14 feather-search"></i></span>
        <input type="text" class="form-control" placeholder="Search brands..." 
               [value]="searchTerm()">
      </div>
    </div>
    <div class="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
      <div class="dropdown me-2">
        <a href="javascript:void(0);"
           class="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
           data-bs-toggle="dropdown">
          Status
        </a>
        <ul class="dropdown-menu dropdown-menu-end p-3">
          <li>
            <a href="javascript:void(0);" class="dropdown-item rounded-1" (click)="onFilterStatus('Active')">
              Active
            </a>
          </li>
          <li>
            <a href="javascript:void(0);" class="dropdown-item rounded-1" (click)="onFilterStatus('Inactive')">
              Inactive
            </a>
          </li>
        </ul>
      </div>
      <div class="dropdown">
        <a href="javascript:void(0);"
           class="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
           data-bs-toggle="dropdown">
          Sort By : Latest
        </a>
        <ul class="dropdown-menu dropdown-menu-end p-3">
          <li>
            <a href="javascript:void(0);" class="dropdown-item rounded-1" (click)="onSort('createdAt')">
              Latest
            </a>
          </li>
          <li>
            <a href="javascript:void(0);" class="dropdown-item rounded-1" (click)="onSort('name')">
              Ascending
            </a>
          </li>
          <li>
            <a href="javascript:void(0);" class="dropdown-item rounded-1" (click)="onSort('name')">
              Descending
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div class="card-body p-0">
    <!-- Loading Spinner -->
    @if (loading(); as isLoading) {
      <div class="text-center p-4">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    } @else {
      <div class="table-responsive">
        <table class="table datatable">
          <thead class="thead-light">
            <tr>
              <th class="no-sort">
                <label class="checkboxs">
                  <input type="checkbox" id="select-all" [checked]="selectAll()" (change)="onSelectAll($event)">
                  <span class="checkmarks"></span>
                </label>
              </th>
              <th>Brand</th>
              <th>Created Date</th>
              <th>Status</th>
              <th class="no-sort">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (brand of filteredBrands()?? []; track brand.id; let i = $index) {
              <tr>
                <td>
                  <label class="checkboxs">
                    <input type="checkbox" [checked]="selectAll()" (change)="onRowSelect(brand.id, $event)">
                    <span class="checkmarks"></span>
                  </label>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <a href="javascript:void(0);" class="avatar avatar-md bg-light-900 p-1 me-2">
                      <img class="object-fit-contain" [src]="brand.imageUrl || 'assets/img/brand/default.png'" [alt]="brand.name">
                    </a>
                    <a href="javascript:void(0);">{{ brand.name }}</a>
                  </div>
                </td>
                <td>{{ DateUtils.format(brand.createdAt) }}</td>
                <td>
                  <span class="badge table-badge" 
                        [ngClass]="{ 'bg-success': brand.status === 'Active', 'bg-danger': brand.status === 'Inactive' }">
                    {{ brand.status }}
                  </span>
                </td>
                <td class="action-table-data">
                  <div class="edit-delete-action">
                    <a class="me-2 p-2" href="#" data-bs-toggle="modal" data-bs-target="#edit-brand" 
                       (click)="openEditModal(brand)">
                      <i data-feather="edit" class="feather-edit"></i>
                    </a>
                    <a data-bs-toggle="modal" data-bs-target="#delete-modal" class="p-2" href="javascript:void(0);"
                       (click)="openDeleteModal(brand)">
                      <i data-feather="trash-2" class="feather-trash-2"></i>
                    </a>
                  </div>
                </td>
              </tr>
            }
            @empty {
              <tr>
                <td colspan="5" class="text-center p-4">No brands found. <button class="btn btn-link" (click)="loadBrands()">Reload</button></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- Pagination (computed from totalRecords) -->
    <!-- @if (totalRecords() > APP_CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE) {
      <div class="d-flex justify-content-end p-3">
        <nav>
          <ul class="pagination">
            <li class="page-item" [class.disabled]="pageSignal() === 1">
              <a class="page-link" (click)="brandSvc.setPage(pageSignal() - 1)">Previous</a>
            </li>
            @for (page of generatePages(totalRecords()); track page; let i = $index) {
              <li class="page-item" [class.active]="page === pageSignal()">
                <a class="page-link" (click)="brandSvc.setPage(page)">{{ page }}</a>
              </li>
            }
            <li class="page-item" [class.disabled]="pageSignal() * APP_CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE >= totalRecords()">
              <a class="page-link" (click)="brandSvc.setPage(pageSignal() + 1)">Next</a>
            </li>
          </ul>
        </nav>
      </div>
    } -->
  </div>
</div>

<!-- Add Brand Modal (Reactive Form Binding) -->
<div class="modal fade" id="add-brand" #addBrandModal>
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <div class="page-title">
          <h4>Add Brand</h4>
        </div>
        <button type="button" class="close bg-danger text-white fs-16" data-bs-dismiss="modal">
          <span>&times;</span>
        </button>
      </div>
      <form [formGroup]="addEditForm" (ngSubmit)="onSubmit()">
        <div class="modal-body new-employee-field">
          <!-- Image Upload (Optional - Use File Upload Service) -->
          <!-- <div class="profile-pic-upload mb-3">
            <div class="profile-pic brand-pic">
              <span><i data-feather="plus-circle"></i> Add Image</span>
            </div>
            <input type="file" (change)="onImageUpload($event)" accept="image/*">
            <p>JPEG, PNG up to 2 MB</p>
          </div> -->
          <div class="mb-3">
            <label class="form-label">Brand <span class="text-danger">*</span></label>
            <input type="text" class="form-control" formControlName="name" [class.is-invalid]="addEditForm.get('name')?.invalid && addEditForm.get('name')?.touched">
            @if (addEditForm.get('name')?.invalid && addEditForm.get('name')?.touched) {
              <div class="invalid-feedback">Name is required (min 3 chars)</div>
            }
          </div>
          <div class="mb-3">
            <label class="form-label">Image URL (Optional)</label>
            <input type="url" class="form-control" formControlName="imageUrl">
          </div>
          <div class="mb-0">
            <div class="status-toggle modal-status d-flex justify-content-between align-items-center">
              <span class="status-label">Status</span>
              <select class="form-control" formControlName="status">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn me-2 btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="!isFormValid">Add Brand</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Edit Brand Modal (Similar Binding) -->
<div class="modal fade" id="edit-brand" #editBrandModal>
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <div class="page-title">
          <h4>Edit Brand</h4>
        </div>
        <button type="button" class="close bg-danger text-white fs-16" data-bs-dismiss="modal">
          <span>&times;</span>
        </button>
      </div>
      <form [formGroup]="addEditForm" (ngSubmit)="onSubmit()">
        <div class="modal-body new-employee-field">
          <!-- Image (show current) -->
          <!-- <div class="profile-pic-upload mb-3">
            <div class="profile-pic brand-pic">
              <span><img [src]="selectedBrand()?.imageUrl || 'default.png'" alt="Current"></span>
              <a href="#" (click)="removeImage()">Remove</a>
            </div>
            <input type="file" (change)="onImageUpload($event)">
          </div> -->
          <div class="mb-3">
            <label class="form-label">Brand <span class="text-danger">*</span></label>
            <input type="text" class="form-control" formControlName="name" 
                   [class.is-invalid]="addEditForm.get('name')?.invalid && addEditForm.get('name')?.touched">
            @if (addEditForm.get('name')?.invalid) {
              <div class="invalid-feedback">Name is required</div>
            }
          </div>
          <div class="mb-3">
            <label class="form-label">Image URL</label>
            <input type="url" class="form-control" formControlName="imageUrl" [value]="selectedBrand()?.imageUrl">
          </div>
          <div class="mb-0">
            <div class="status-toggle modal-status d-flex justify-content-between align-items-center">
              <span class="status-label">Status</span>
              <select class="form-control" formControlName="status">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn me-2 btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="!isFormValid">Save Changes</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Delete Modal -->
<div class="modal fade" id="delete-modal" #deleteModal>
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-body new-employee-field">
        <div class="text-center">
          <span class="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2">
            <i class="ti ti-trash fs-24 text-danger"></i>
          </span>
          <h4 class="fs-20 fw-bold mb-2 mt-1">Delete Brand</h4>
          <p class="mb-0 fs-16">Are you sure you want to delete {{ selectedBrand()?.name }}?</p>
          <div class="modal-footer-btn mt-3 d-flex justify-content-center">
            <button type="button" class="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" 
                    data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary fs-13 fw-medium p-2 px-3" (click)="confirmDelete()">Yes Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
*/













































// <div class="page-header">
//     <div class="add-item d-flex">
//         <div class="page-title">
//             <h4 class="fw-bold">Brand</h4>
//             <h6>Manage your brands</h6>
//         </div>
//     </div>
//     <ul class="table-top-head">
//         <li>
//             <a data-bs-toggle="tooltip" data-bs-placement="top" title="Pdf"><img src="assets/img/icons/pdf.svg"
//                     alt="img"></a>
//         </li>
//         <li>
//             <a data-bs-toggle="tooltip" data-bs-placement="top" title="Excel"><img src="assets/img/icons/excel.svg"
//                     alt="img"></a>
//         </li>
//         <li>
//             <a data-bs-toggle="tooltip" data-bs-placement="top" title="Refresh"><i class="ti ti-refresh"></i></a>
//         </li>
//         <li>
//             <a data-bs-toggle="tooltip" data-bs-placement="top" title="Collapse" id="collapse-header"><i
//                     class="ti ti-chevron-up"></i></a>
//         </li>
//     </ul>
//     <div class="page-btn">
//         <a href="#" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-brand"><i
//                 class="ti ti-circle-plus me-1"></i>Add Brand</a>
//     </div>
// 	<div class="page-btn">
//         <button class="btn btn-primary" (click)="Save()"><i
//         	class="ti ti-circle-plus me-1"></i>Toster</button>
//     </div>
// </div>
// <!-- /product list -->
// <div class="card">
//     <div class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
//         <div class="search-set">
//             <!-- <div class="search-input">
//                 <span class="btn-searchset"><i class="ti ti-search fs-14 feather-search"></i></span>
//             </div> -->
//         </div>
//         <div class="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
//             <div class="dropdown me-2">
//                 <a href="javascript:void(0);"
//                     class="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
//                     data-bs-toggle="dropdown">
//                     Status
//                 </a>
//                 <ul class="dropdown-menu  dropdown-menu-end p-3">
//                     <li>
//                         <a href="javascript:void(0);" class="dropdown-item rounded-1">Active</a>
//                     </li>
//                     <li>
//                         <a href="javascript:void(0);" class="dropdown-item rounded-1">Inactive</a>
//                     </li>
//                 </ul>
//             </div>
//             <div class="dropdown">
//                 <a href="javascript:void(0);"
//                     class="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
//                     data-bs-toggle="dropdown">
//                     Sort By : Latest
//                 </a>
//                 <ul class="dropdown-menu  dropdown-menu-end p-3">
//                     <li>
//                         <a href="javascript:void(0);" class="dropdown-item rounded-1">Latest</a>
//                     </li>
//                     <li>
//                         <a href="javascript:void(0);" class="dropdown-item rounded-1">Ascending</a>
//                     </li>
//                     <li>
//                         <a href="javascript:void(0);" class="dropdown-item rounded-1">Desending</a>
//                     </li>
//                 </ul>
//             </div>
//         </div>
//     </div>
//     <div class="card-body p-0">
//         <div class="table-responsive">
//             <table class="table datatable">
//                 <thead class="thead-light">
//                     <tr>
//                         <th class="no-sort">
//                             <label class="checkboxs">
//                                 <input type="checkbox" id="select-all">
//                                 <span class="checkmarks"></span>
//                             </label>
//                         </th>
//                         <th>Brand</th>
//                         <th>Created Date</th>
//                         <th>Status</th>
//                         <th class="no-sort"></th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     <tr>
//                         <td>
//                             <label class="checkboxs">
//                                 <input type="checkbox">
//                                 <span class="checkmarks"></span>
//                             </label>
//                         </td>
//                         <td>
//                             <div class="d-flex align-items-center">
//                                 <a href="javascript:void(0);" class="avatar avatar-md bg-light-900 p-1 me-2">
//                                     <img class="object-fit-contain" src="assets/img/brand/lenova.png" alt="img">
//                                 </a>
//                                 <a href="javascript:void(0);">Lenovo</a>
//                             </div>
//                         </td>
//                         <td>24 Dec 2024</td>
//                         <td><span class="badge table-badge bg-success fw-medium fs-10">Active</span></td>
//                         <td class="action-table-data">
//                             <div class="edit-delete-action">
//                                 <a class="me-2 p-2" href="#" data-bs-toggle="modal" data-bs-target="#edit-brand">
//                                     <i data-feather="edit" class="feather-edit"></i>
//                                 </a>
//                                 <a data-bs-toggle="modal" data-bs-target="#delete-modal" class="p-2"
//                                     href="javascript:void(0);">
//                                     <i data-feather="trash-2" class="feather-trash-2"></i>
//                                 </a>
//                             </div>

//                         </td>
//                     </tr>
//                 </tbody>
//             </table>
//         </div>
//     </div>
// </div>
// <!-- /product list -->


// 	<!-- Add Brand -->
// 	<div class="modal fade" id="add-brand">
// 		<div class="modal-dialog modal-dialog-centered">
// 			<div class="modal-content">
// 				<div class="modal-header">
// 					<div class="page-title">
// 						<h4>Add Brand</h4>
// 					</div>
// 					<button type="button" class="close bg-danger text-white fs-16" data-bs-dismiss="modal" aria-label="Close">
// 						<span aria-hidden="true">&times;</span>
// 					</button>
// 				</div>
// 				<form >
// 					<div class="modal-body new-employee-field">
// 						<!-- <div class="profile-pic-upload mb-3">
// 							<div class="profile-pic brand-pic">
// 								<span><i data-feather="plus-circle" class="plus-down-add"></i> Add Image</span>
// 							</div>
// 							<div>
// 								<div class="image-upload mb-0">
// 									<input type="file">
// 									<div class="image-uploads">
// 										<h4>Upload Image</h4>
// 									</div>
// 								</div>
// 								<p class="mt-2">JPEG, PNG up to 2 MB</p>
// 							</div>
// 						</div> -->
// 						<div class="mb-3">
// 							<label class="form-label">Brand<span class="text-danger ms-1">*</span></label>
// 							<input type="text" class="form-control">
// 						</div>
// 						<div class="mb-0">
// 							<div class="status-toggle modal-status d-flex justify-content-between align-items-center">
// 								<span class="status-label">Status</span>
// 								<input type="checkbox" id="user2" class="check" checked="">
// 								<label for="user2" class="checktoggle"></label>
// 							</div>
// 						</div>
// 					</div>
// 					<div class="modal-footer">
// 						<button type="button" class="btn me-2 btn-secondary" data-bs-dismiss="modal">Cancel</button>
// 						<button type="submit" class="btn btn-primary">Add Brand</button>
// 					</div>
// 				</form>
// 			</div>
// 		</div>
// 	</div>
// 	<!-- /Add Brand -->

// 	<!-- Edit Brand -->
// 	<div class="modal fade" id="edit-brand">
// 		<div class="modal-dialog modal-dialog-centered">
// 			<div class="modal-content">
// 				<div class="modal-header">
// 					<div class="page-title">
// 						<h4>Edit Brand</h4>
// 					</div>
// 					<button type="button" class="close bg-danger text-white fs-16" data-bs-dismiss="modal" aria-label="Close">
// 						<span aria-hidden="true">&times;</span>
// 					</button>
// 				</div>
// 				<form>
// 					<div class="modal-body new-employee-field">
// 						<!-- <div class="profile-pic-upload mb-3">
// 							<div class="profile-pic brand-pic">
// 								<span><img src="assets/img/brand/brand-icon-02.png" alt="Img"></span>
// 								<a href="javascript:void(0);" class="remove-photo"><i data-feather="x" class="x-square-add"></i></a>
// 							</div>
// 							<div>
// 							<div class="image-upload mb-0">
// 								<input type="file">
// 								<div class="image-uploads">
// 									<h4>Change Image</h4>
// 								</div>
// 							</div>
// 							<p class="mt-2">JPEG, PNG up to 2 MB</p>
// 						</div>
// 						</div> -->
// 						<div class="mb-3">
// 							<label class="form-label">Brand<span class="text-danger ms-1">*</span></label>
// 							<input type="text" class="form-control" value="Lenovo">
// 						</div>
// 						<div class="mb-0">
// 							<div class="status-toggle modal-status d-flex justify-content-between align-items-center">
// 								<span class="status-label">Status</span>
// 								<input type="checkbox" id="user4" class="check" checked="">
// 								<label for="user4" class="checktoggle"></label>
// 							</div>
// 						</div>
// 					</div>
// 					<div class="modal-footer">
// 						<button type="button" class="btn me-2 btn-secondary" data-bs-dismiss="modal">Cancel</button>
// 						<button type="click" class="btn btn-primary" (click)="Save()">Save Changes</button>
// 					</div>
// 				</form>
// 			</div>
// 		</div>
// 	</div>
// 	<!-- Edit Brand -->

// 	<!-- delete modal -->
// 	<div class="modal fade" id="delete-modal">
// 		<div class="modal-dialog modal-dialog-centered">
// 			<div class="modal-content">
//                 <div class="modal-body new-employee-field">
//                     <div class="text-center">
//                     		<span class="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2"><i class="ti ti-trash fs-24 text-danger"></i></span>
// 							<h4 class="fs-20 fw-bold mb-2 mt-1">Delete Brand</h4>
// 							<p class="mb-0 fs-16">Are you sure you want to delete brand?</p>
// 							<div class="modal-footer-btn mt-3 d-flex justify-content-center">
// 								<button type="button" class="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">Cancel</button>
// 								<button type="submit" class="btn btn-primary fs-13 fw-medium p-2 px-3">Yes Delete</button>
// 							</div>						
// 					</div>					
//                 </div>
// 				<!-- <div class="page-wrapper-new p-0">
// 					<div class="content  px-3 text-center">
// 							<span class="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2"><i class="ti ti-trash fs-24 text-danger"></i></span>
// 							<h4 class="fs-20 fw-bold mb-2 mt-1">Delete Brand</h4>
// 							<p class="mb-0 fs-16">Are you sure you want to delete brand?</p>
// 							<div class="modal-footer-btn mt-3 d-flex justify-content-center">
// 								<button type="button" class="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" data-bs-dismiss="modal">Cancel</button>
// 								<button type="submit" class="btn btn-primary fs-13 fw-medium p-2 px-3">Yes Delete</button>
// 							</div>						
// 					</div>
// 				</div> -->
// 			</div>
// 		</div>
// 	</div>




  