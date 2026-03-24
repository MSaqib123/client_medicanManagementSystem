import { Component, signal, computed, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BrandService } from '../../../core/services/brand.service';
import { Brand } from '../../../core/models';
import { BrandCreateUpdateComponent } from '../brand-create-update/brand-create-update.component';
import { BrandDeleteComponent } from '../brand-delete/brand-delete.component';
import { BrandDetailComponent } from '../brand-detail/brand-detail.component';

@Component({
  selector: 'app-brand-list',
  standalone: false,                    // ← FIXED
  templateUrl: './brand-list.component.html',
  styleUrls: ['./brand-list.component.css']
})
export class BrandListComponent {
  // Local signals
  brands = signal<Brand[]>([]);  
  loading = signal<boolean>(false);
  error = signal<string>('');
  searchTerm = signal<string>('');
  statusFilter = signal<string | null>(null);
  sortBy = signal<'name' | 'createdAt'>('createdAt');
  sortDir = signal<'asc' | 'desc'>('desc');
  currentPage = signal<number>(1);
  pageSize = 10;

  // Computed signals
  filteredBrands = computed(() => {
    let data = [...this.brands()];

    if (this.searchTerm()) {
      data = data.filter(brand => 
        brand.name.toLowerCase().includes(this.searchTerm().toLowerCase())
      );
    }

    if (this.statusFilter()) {
      data = data.filter(brand => brand.status === this.statusFilter());
    }

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

  selectAll = signal<boolean>(false);
  selectedRows = signal<Set<string>>(new Set());

  // ViewChild for child modal components
  @ViewChild(BrandCreateUpdateComponent) createUpdateModal!: BrandCreateUpdateComponent;
  @ViewChild(BrandDeleteComponent) deleteModal!: BrandDeleteComponent;
  @ViewChild(BrandDetailComponent) detailModal!: BrandDetailComponent;

  constructor(
    private brandSvc: BrandService,
    private toastr: ToastrService
  ) {
    this.loadBrands();
  }

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

  onSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectAll.set(checked);
    if (checked) {
      this.selectedRows.set(new Set(this.paginatedBrands().map(b => b.id)));
    } else {
      this.selectedRows.set(new Set());
    }
  }

  onRowSelect(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedRows.update(set => {
      checked ? set.add(id) : set.delete(id);
      return new Set(set);
    });
    this.selectAll.set(this.selectedRows().size === this.paginatedBrands().length);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  onFilterStatus(status: string): void {
    this.statusFilter.set(status === 'all' ? null : status);
    this.currentPage.set(1);
    this.toastr.info(`Filtered by ${status === 'all' ? 'All' : status}`);
  }

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
    this.currentPage.set(1);
    this.toastr.info(`Sorted by ${type}`);
  }

  exportToPdf(): void {
    this.toastr.info('PDF exported');
  }

  exportToExcel(): void {
    this.toastr.info('Excel exported');
  }

  refresh(): void {
    this.loadBrands();
    this.toastr.info('Refreshed');
  }

  openAddModal(): void {
    this.createUpdateModal.openAdd();
  }

  openEditModal(brand: Brand): void {
    this.createUpdateModal.openEdit(brand);
  }

  openDeleteModal(brand: Brand): void {
    this.deleteModal.open(brand);
  }

  openDetailModal(brand: Brand): void {
    this.detailModal.open(brand);
  }

  onBrandAdded(newBrand: Brand): void {
    this.brands.update(list => [...list, newBrand]);
  }

  onBrandUpdated(updated: Brand): void {
    this.brands.update(list => list.map(b => b.id === updated.id ? updated : b));
  }

  onBrandDeleted(id: string): void {
    this.brands.update(brands => brands.filter(b => b.id !== id));
  }
}