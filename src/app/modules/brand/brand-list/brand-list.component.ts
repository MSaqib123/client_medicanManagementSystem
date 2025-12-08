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





// // brand-list.component.ts (Updated with Signal Support)
// import { Component, signal, computed, effect, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule,FormsModule } from '@angular/forms';  // For advanced forms
// import { RouterLink, RouterLinkActive } from '@angular/router';
// import { CommonModule } from '@angular/common';  // For @for, etc.
// import { ToastrService } from 'ngx-toastr';  // For notifications
// import { BrandService } from '../../../core/services/brand.service';
// import { Brand, CreateBrand } from '../../../core/models';
// import { APP_CONSTANTS } from '../../../core/constants/app.constants';
// import { DateUtils } from '../../../core/utils/date.utils';
// import { ValidationUtils } from '../../../core/utils/validation.utils';
// declare var bootstrap: any;

// /**
//  * BrandListComponent - Signal-driven table with modals.
//  * @description Uses BrandService signals for reactive list. Handles CRUD via modals.
//  * @example Brands update auto-refreshes table via effect.
//  */
// @Component({
//   selector: 'app-brand-list',
//   standalone: false,  // Module-based; import ReactiveFormsModule in BrandModule
//   templateUrl: './brand-list.component.html',
//   styleUrls: ['./brand-list.component.css']  // Fixed plural
// })
// export class BrandListComponent {
// APP_CONSTANTS: any;
// DateUtils: any;
// onRowSelect(arg0: any,$event: Event) {
// throw new Error('Method not implemented.');
// }
// onFilterStatus(arg0: string) {
// throw new Error('Method not implemented.');
// }
//   // Signals from service (reactive)
//   brands = signal<Brand[]>([]);  // Signal<Brand[]>
//   loading = signal<boolean>(false);  // Signal<boolean>
//   error = signal<string | null>(null);  // Signal<string | null>

//   // Local signals
//   selectedBrand = signal<Brand | null>(null);  // For edit
//   isEditing = signal<boolean>(false);  // Toggle add/edit mode
//   searchTerm = signal<string>('');  // For filtering (computed)
//   filteredBrands!: ReturnType<typeof computed>;
//   totalRecords!: ReturnType<typeof computed>;
//   selectAll = signal<boolean>(false);  // For checkboxes

//   // Forms (Reactive for validation)
//   addEditForm: FormGroup;

//   // ViewChild for modals (Bootstrap integration)
//   @ViewChild('addBrandModal', { static: false }) addBrandModal!: ElementRef;
//   @ViewChild('editBrandModal', { static: false }) editBrandModal!: ElementRef;
//   @ViewChild('deleteModal', { static: false }) deleteModal!: ElementRef;

//   constructor(
//     private brandSvc: BrandService,
//     private fb: FormBuilder,
//     private toastr: ToastrService,
//     private cdr: ChangeDetectorRef
//   ) {
//     // Init signals from service after brandSvc is initialized
//     effect(() => {
//       this.brands.set(this.brandSvc.brandsSignal());
//       this.loading.set(this.brandSvc.loading());
//       this.error.set(this.brandSvc.error());
//     });

//     // Init computed signals
//     this.filteredBrands = computed(() => 
//       this.brands().filter(brand => 
//         brand.name.toLowerCase().includes(this.searchTerm().toLowerCase())
//       )
//     );
//     this.totalRecords = computed(() => this.brands().length);

//     // Init form
//     this.addEditForm = this.fb.group({
//       name: ['', [Validators.required, Validators.minLength(3)]],
//       status: ['Active', Validators.required],
//       imageUrl: ['', Validators.pattern(ValidationUtils.isValidUrl ? new RegExp(ValidationUtils.isValidUrl) : '')]  // Optional image
//     });

//     // Effect: Auto-mark for check on signal changes (for OnPush if used)
//     effect(() => {
//       if (this.brands() || this.loading() || this.error()) {
//         this.cdr.markForCheck();
//       }
//     });

//     // Effect: Auto-filter on search change
//     effect(() => {
//       const term = this.searchTerm();
//       this.brandSvc.search(term);  // Trigger service search
//     });

//     // Load initial data
//     this.loadBrands();
//   }

//   /**
//    * Load brands (triggers service fetch).
//    */
//   loadBrands(): void {
//     this.brandSvc.getBrands({ page: 1 }).subscribe({
//       error: err => this.toastr.error('Failed to load brands')
//     });
//   }

//   /**
//    * Toggle select all checkboxes.
//    */
//   onSelectAll(event: Event): void {
//     const checked = (event.target as HTMLInputElement).checked;
//     this.selectAll.set(checked);
//     // In real: Loop brands() and set selected property if added to model
//   }

//   /**
//    * Open add modal.
//    */
//   openAddModal(): void {
//     this.isEditing.set(false);
//     this.addEditForm.reset({ status: 'Active' });
//     const modal = new bootstrap.Modal(this.addBrandModal.nativeElement);
//     modal.show();
//   }

//   /**
//    * Open edit modal.
//    * @param brand Brand to edit.
//    */
//   openEditModal(brand: Brand): void {
//     this.isEditing.set(true);
//     this.selectedBrand.set(brand);
//     this.addEditForm.patchValue({
//       name: brand.name,
//       status: brand.status || 'Active',
//       imageUrl: brand.imageUrl || ''
//     });
//     const modal = new bootstrap.Modal(this.editBrandModal.nativeElement);
//     modal.show();
//   }

//   /**
//    * Submit add/edit form.
//    */
//   onSubmit(): void {
//     if (this.addEditForm.invalid) {
//       this.toastr.warning('Please fix form errors');
//       return;
//     }

//     const formValue = this.addEditForm.value;
//     const payload: CreateBrand = {
//       name: formValue.name,
//       status: formValue.status, // Assume model has status
//       imageUrl: formValue.imageUrl,
//       createdByUserId: ''
//     };

//     if (this.isEditing()) {
//       // Update
//       const id = this.selectedBrand()?.id;
//       if (id) {
//         this.brandSvc.update(id, payload)
//         // .subscribe({
//         //   next: () => {
//         //     this.toastr.success('Brand updated');
//         //     this.closeModal('edit-brand');
//         //     this.loadBrands();  // Refetch
//         //   },
//         //   error: () => this.toastr.error('Update failed')
//         // });
//       }
//     } else {
//       // Create
//       this.brandSvc.create(payload).subscribe({
//         next: (newBrand) => {
//           this.toastr.success('Brand added');
//           this.closeModal('add-brand');
//           this.loadBrands();  // Auto-refetch via effect
//         },
//         error: () => this.toastr.error('Add failed')
//       });
//     }
//   }

//   /**
//    * Delete brand.
//    * @param brand Brand to delete.
//    */
//   openDeleteModal(brand: Brand): void {
//     this.selectedBrand.set(brand);
//     const modal = new bootstrap.Modal(this.deleteModal.nativeElement);
//     modal.show();
//   }

//   confirmDelete(): void {
//     const id = this.selectedBrand()?.id;
//     if (id) {
//       this.brandSvc.delete(id)
//       // .subscribe({
//       //   next: () => {
//       //     this.toastr.success('Brand deleted');
//       //     this.closeModal('delete-modal');
//       //     this.loadBrands();
//       //   },
//       //   error: () => this.toastr.error('Delete failed')
//       // });
//     }
//   }

//   /**
//    * Search brands.
//    * @param term Search input.
//    */
//   onSearch(term: string): void {
//     this.searchTerm.set(term);
//   }

//   /**
//    * Sort by status/date (update service params).
//    * @param sortBy 'name' | 'date' | 'status'.
//    */
//   onSort(sortBy: 'name' | 'createdAt' | 'status'): void {
//     // Trigger service sort (assume service has sort method)
//     this.brandSvc.getBrands({ page: 1, pageSize: 10 }).subscribe();
//     // TODO: Implement sort in BrandService if needed
//   }

//   /**
//    * Export to PDF/Excel (placeholder - integrate jsPDF or ExcelJS).
//    */
//   exportToPdf(): void {
//     // Advanced: Use brands() signal for data
//     console.log('Export PDF:', this.brands());
//     this.toastr.info('PDF export triggered');
//   }

//   exportToExcel(): void {
//     console.log('Export Excel:', this.brands());
//     this.toastr.info('Excel export triggered');
//   }

//   /**
//    * Refresh table.
//    */
//   refresh(): void {
//     this.loadBrands();
//     this.toastr.info('Refreshed');
//   }

//   /**
//    * Close modal helper.
//    * @param modalId Bootstrap modal ID.
//    */
//   private closeModal(modalId: string): void {
//     const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
//     modal?.hide();
//   }

//   // Getters for template (signal-friendly)
//   get isFormValid(): boolean { return this.addEditForm.valid; }
//   get formErrors(): any { return this.addEditForm.errors; }
// }











































/*
// // <!-- brand-list.component.html (Updated with Signals & Reactive Binding) -->
// // <div class="page-header">
// //   <div class="add-item d-flex">
// //     <div class="page-title">
// //       <h4 class="fw-bold">Brand</h4>
// //       <h6>Manage your brands</h6>
// //     </div>
// //   </div>
// //   <ul class="table-top-head">
// //     <li>
// //       <a data-bs-toggle="tooltip" data-bs-placement="top" title="Pdf" (click)="exportToPdf()">
// //         <img src="assets/img/icons/pdf.svg" alt="img">
// //       </a>
// //     </li>
// //     <li>
// //       <a data-bs-toggle="tooltip" data-bs-placement="top" title="Excel" (click)="exportToExcel()">
// //         <img src="assets/img/icons/excel.svg" alt="img">
// //       </a>
// //     </li>
// //     <li>
// //       <a data-bs-toggle="tooltip" data-bs-placement="top" title="Refresh" (click)="refresh()">
// //         <i class="ti ti-refresh"></i>
// //       </a>
// //     </li>
// //     <li>
// //       <a data-bs-toggle="tooltip" data-bs-placement="top" title="Collapse" id="collapse-header">
// //         <i class="ti ti-chevron-up"></i>
// //       </a>
// //     </li>
// //   </ul>
// //   <div class="page-btn">
// //     <a href="#" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-brand" (click)="openAddModal()">
// //       <i class="ti ti-circle-plus me-1"></i>Add Brand
// //     </a>
// //   </div>
// // </div>

// // <!-- Table with Signal Binding -->
// // <div class="card">
// //   <div class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
// //     <div class="search-set">
// //       <!-- Search Input (binds to signal) -->
// //       <div class="search-input">
// //         <span class="btn-searchset"><i class="ti ti-search fs-14 feather-search"></i></span>
// //         <input type="text" class="form-control" placeholder="Search brands..." 
// //                [value]="searchTerm()">
// //       </div>
// //     </div>
// //     <div class="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
// //       <div class="dropdown me-2">
// //         <a href="javascript:void(0);"
// //            class="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
// //            data-bs-toggle="dropdown">
// //           Status
// //         </a>
// //         <ul class="dropdown-menu dropdown-menu-end p-3">
// //           <li>
// //             <a href="javascript:void(0);" class="dropdown-item rounded-1" (click)="onFilterStatus('Active')">
// //               Active
// //             </a>
// //           </li>
// //           <li>
// //             <a href="javascript:void(0);" class="dropdown-item rounded-1" (click)="onFilterStatus('Inactive')">
// //               Inactive
// //             </a>
// //           </li>
// //         </ul>
// //       </div>
// //       <div class="dropdown">
// //         <a href="javascript:void(0);"
// //            class="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
// //            data-bs-toggle="dropdown">
// //           Sort By : Latest
// //         </a>
// //         <ul class="dropdown-menu dropdown-menu-end p-3">
// //           <li>
// //             <a href="javascript:void(0);" class="dropdown-item rounded-1" (click)="onSort('createdAt')">
// //               Latest
// //             </a>
// //           </li>
// //           <li>
// //             <a href="javascript:void(0);" class="dropdown-item rounded-1" (click)="onSort('name')">
// //               Ascending
// //             </a>
// //           </li>
// //           <li>
// //             <a href="javascript:void(0);" class="dropdown-item rounded-1" (click)="onSort('name')">
// //               Descending
// //             </a>
// //           </li>
// //         </ul>
// //       </div>
// //     </div>
// //   </div>
// //   <div class="card-body p-0">
// //     <!-- Loading Spinner -->
// //     @if (loading(); as isLoading) {
// //       <div class="text-center p-4">
// //         <div class="spinner-border" role="status">
// //           <span class="visually-hidden">Loading...</span>
// //         </div>
// //       </div>
// //     } @else {
// //       <div class="table-responsive">
// //         <table class="table datatable">
// //           <thead class="thead-light">
// //             <tr>
// //               <th class="no-sort">
// //                 <label class="checkboxs">
// //                   <input type="checkbox" id="select-all" [checked]="selectAll()" (change)="onSelectAll($event)">
// //                   <span class="checkmarks"></span>
// //                 </label>
// //               </th>
// //               <th>Brand</th>
// //               <th>Created Date</th>
// //               <th>Status</th>
// //               <th class="no-sort">Actions</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             @for (brand of filteredBrands()?? []; track brand.id; let i = $index) {
// //               <tr>
// //                 <td>
// //                   <label class="checkboxs">
// //                     <input type="checkbox" [checked]="selectAll()" (change)="onRowSelect(brand.id, $event)">
// //                     <span class="checkmarks"></span>
// //                   </label>
// //                 </td>
// //                 <td>
// //                   <div class="d-flex align-items-center">
// //                     <a href="javascript:void(0);" class="avatar avatar-md bg-light-900 p-1 me-2">
// //                       <img class="object-fit-contain" [src]="brand.imageUrl || 'assets/img/brand/default.png'" [alt]="brand.name">
// //                     </a>
// //                     <a href="javascript:void(0);">{{ brand.name }}</a>
// //                   </div>
// //                 </td>
// //                 <td>{{ DateUtils.format(brand.createdAt) }}</td>
// //                 <td>
// //                   <span class="badge table-badge" 
// //                         [ngClass]="{ 'bg-success': brand.status === 'Active', 'bg-danger': brand.status === 'Inactive' }">
// //                     {{ brand.status }}
// //                   </span>
// //                 </td>
// //                 <td class="action-table-data">
// //                   <div class="edit-delete-action">
// //                     <a class="me-2 p-2" href="#" data-bs-toggle="modal" data-bs-target="#edit-brand" 
// //                        (click)="openEditModal(brand)">
// //                       <i data-feather="edit" class="feather-edit"></i>
// //                     </a>
// //                     <a data-bs-toggle="modal" data-bs-target="#delete-modal" class="p-2" href="javascript:void(0);"
// //                        (click)="openDeleteModal(brand)">
// //                       <i data-feather="trash-2" class="feather-trash-2"></i>
// //                     </a>
// //                   </div>
// //                 </td>
// //               </tr>
// //             }
// //             @empty {
// //               <tr>
// //                 <td colspan="5" class="text-center p-4">No brands found. <button class="btn btn-link" (click)="loadBrands()">Reload</button></td>
// //               </tr>
// //             }
// //           </tbody>
// //         </table>
// //       </div>
// //     }

// //     <!-- Pagination (computed from totalRecords) -->
// //     <!-- @if (totalRecords() > APP_CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE) {
// //       <div class="d-flex justify-content-end p-3">
// //         <nav>
// //           <ul class="pagination">
// //             <li class="page-item" [class.disabled]="pageSignal() === 1">
// //               <a class="page-link" (click)="brandSvc.setPage(pageSignal() - 1)">Previous</a>
// //             </li>
// //             @for (page of generatePages(totalRecords()); track page; let i = $index) {
// //               <li class="page-item" [class.active]="page === pageSignal()">
// //                 <a class="page-link" (click)="brandSvc.setPage(page)">{{ page }}</a>
// //               </li>
// //             }
// //             <li class="page-item" [class.disabled]="pageSignal() * APP_CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE >= totalRecords()">
// //               <a class="page-link" (click)="brandSvc.setPage(pageSignal() + 1)">Next</a>
// //             </li>
// //           </ul>
// //         </nav>
// //       </div>
// //     } -->
// //   </div>
// // </div>

// // <!-- Add Brand Modal (Reactive Form Binding) -->
// // <div class="modal fade" id="add-brand" #addBrandModal>
// //   <div class="modal-dialog modal-dialog-centered">
// //     <div class="modal-content">
// //       <div class="modal-header">
// //         <div class="page-title">
// //           <h4>Add Brand</h4>
// //         </div>
// //         <button type="button" class="close bg-danger text-white fs-16" data-bs-dismiss="modal">
// //           <span>&times;</span>
// //         </button>
// //       </div>
// //       <form [formGroup]="addEditForm" (ngSubmit)="onSubmit()">
// //         <div class="modal-body new-employee-field">
// //           <!-- Image Upload (Optional - Use File Upload Service) -->
// //           <!-- <div class="profile-pic-upload mb-3">
// //             <div class="profile-pic brand-pic">
// //               <span><i data-feather="plus-circle"></i> Add Image</span>
// //             </div>
// //             <input type="file" (change)="onImageUpload($event)" accept="image/*">
// //             <p>JPEG, PNG up to 2 MB</p>
// //           </div> -->
// //           <div class="mb-3">
// //             <label class="form-label">Brand <span class="text-danger">*</span></label>
// //             <input type="text" class="form-control" formControlName="name" [class.is-invalid]="addEditForm.get('name')?.invalid && addEditForm.get('name')?.touched">
// //             @if (addEditForm.get('name')?.invalid && addEditForm.get('name')?.touched) {
// //               <div class="invalid-feedback">Name is required (min 3 chars)</div>
// //             }
// //           </div>
// //           <div class="mb-3">
// //             <label class="form-label">Image URL (Optional)</label>
// //             <input type="url" class="form-control" formControlName="imageUrl">
// //           </div>
// //           <div class="mb-0">
// //             <div class="status-toggle modal-status d-flex justify-content-between align-items-center">
// //               <span class="status-label">Status</span>
// //               <select class="form-control" formControlName="status">
// //                 <option value="Active">Active</option>
// //                 <option value="Inactive">Inactive</option>
// //               </select>
// //             </div>
// //           </div>
// //         </div>
// //         <div class="modal-footer">
// //           <button type="button" class="btn me-2 btn-secondary" data-bs-dismiss="modal">Cancel</button>
// //           <button type="submit" class="btn btn-primary" [disabled]="!isFormValid">Add Brand</button>
// //         </div>
// //       </form>
// //     </div>
// //   </div>
// // </div>

// // <!-- Edit Brand Modal (Similar Binding) -->
// // <div class="modal fade" id="edit-brand" #editBrandModal>
// //   <div class="modal-dialog modal-dialog-centered">
// //     <div class="modal-content">
// //       <div class="modal-header">
// //         <div class="page-title">
// //           <h4>Edit Brand</h4>
// //         </div>
// //         <button type="button" class="close bg-danger text-white fs-16" data-bs-dismiss="modal">
// //           <span>&times;</span>
// //         </button>
// //       </div>
// //       <form [formGroup]="addEditForm" (ngSubmit)="onSubmit()">
// //         <div class="modal-body new-employee-field">
// //           <!-- Image (show current) -->
// //           <!-- <div class="profile-pic-upload mb-3">
// //             <div class="profile-pic brand-pic">
// //               <span><img [src]="selectedBrand()?.imageUrl || 'default.png'" alt="Current"></span>
// //               <a href="#" (click)="removeImage()">Remove</a>
// //             </div>
// //             <input type="file" (change)="onImageUpload($event)">
// //           </div> -->
// //           <div class="mb-3">
// //             <label class="form-label">Brand <span class="text-danger">*</span></label>
// //             <input type="text" class="form-control" formControlName="name" 
// //                    [class.is-invalid]="addEditForm.get('name')?.invalid && addEditForm.get('name')?.touched">
// //             @if (addEditForm.get('name')?.invalid) {
// //               <div class="invalid-feedback">Name is required</div>
// //             }
// //           </div>
// //           <div class="mb-3">
// //             <label class="form-label">Image URL</label>
// //             <input type="url" class="form-control" formControlName="imageUrl" [value]="selectedBrand()?.imageUrl">
// //           </div>
// //           <div class="mb-0">
// //             <div class="status-toggle modal-status d-flex justify-content-between align-items-center">
// //               <span class="status-label">Status</span>
// //               <select class="form-control" formControlName="status">
// //                 <option value="Active">Active</option>
// //                 <option value="Inactive">Inactive</option>
// //               </select>
// //             </div>
// //           </div>
// //         </div>
// //         <div class="modal-footer">
// //           <button type="button" class="btn me-2 btn-secondary" data-bs-dismiss="modal">Cancel</button>
// //           <button type="submit" class="btn btn-primary" [disabled]="!isFormValid">Save Changes</button>
// //         </div>
// //       </form>
// //     </div>
// //   </div>
// // </div>

// // <!-- Delete Modal -->
// // <div class="modal fade" id="delete-modal" #deleteModal>
// //   <div class="modal-dialog modal-dialog-centered">
// //     <div class="modal-content">
// //       <div class="modal-body new-employee-field">
// //         <div class="text-center">
// //           <span class="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2">
// //             <i class="ti ti-trash fs-24 text-danger"></i>
// //           </span>
// //           <h4 class="fs-20 fw-bold mb-2 mt-1">Delete Brand</h4>
// //           <p class="mb-0 fs-16">Are you sure you want to delete {{ selectedBrand()?.name }}?</p>
// //           <div class="modal-footer-btn mt-3 d-flex justify-content-center">
// //             <button type="button" class="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none" 
// //                     data-bs-dismiss="modal">Cancel</button>
// //             <button type="button" class="btn btn-primary fs-13 fw-medium p-2 px-3" (click)="confirmDelete()">Yes Delete</button>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   </div>
// // </div>
*/