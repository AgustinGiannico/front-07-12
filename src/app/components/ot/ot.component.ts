import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OtService } from '../../services/ot.service';
import { Ot } from '../../interfaces/ot';

@Component({
  selector: 'app-ot',
  templateUrl: './ot.component.html',
  styleUrls: ['./ot.component.css']
})
export class OtComponent implements OnInit {
  ots: Ot[] = [];
  paginatedOts: Ot[] = [];
  otForm: FormGroup;
  selectedOt: Ot | null = null;
  message: string | null = null;
  showForm: boolean = false;


  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(
    private otService: OtService, 
    private fb: FormBuilder, 
    private location: Location
  ) {
    this.otForm = this.fb.group({
      id_ot: [null],
      order_number: ['', Validators.required],
      request_date: [''],
      initial_date: [''],
      completion_date: [''],
      completion_time: [''],
      observations: [''],
      id_user: [null, Validators.required],
      id_task_list: [null, Validators.required],
      id_priority: [null, Validators.required],
      id_ot_state: [null, Validators.required],
      id_tag: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.getAllOts();
  }

  goBack(): void {
    this.location.back();
  }

  getAllOts(): void {
    this.otService.getAll().subscribe({
      next: (ots) => {
        this.ots = ots.map((ot: Ot) => ({
          ...ot,
          request_date: this.formatDateToDDMMYYYY(ot.request_date),
          initial_date: ot.initial_date ? this.formatDateToDDMMYYYY(ot.initial_date) : 'Sin fecha',
          completion_date: ot.completion_date ? this.formatDateToDDMMYYYY(ot.completion_date) : 'Sin fecha',
        }));
        this.updatePagination();
      },
      error: () => {
        this.message = 'Error al cargar las órdenes de trabajo.';
      },
    });
  }
  
  private formatDateToDDMMYYYY(date: string | Date): string {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0'); // Mes comienza en 0
    const year = parsedDate.getFullYear();
    return `${day}-${month}-${year}`; // Formato "DD-MM-AAAA"
  }
  

  updatePagination(): void {
    this.totalPages = Math.ceil(this.ots.length / this.itemsPerPage);
    this.updatePaginatedOts();
  }

  updatePaginatedOts(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedOts = this.ots.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedOts();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedOts();
    }
  }

  openCreateForm(): void {
    this.selectedOt = null;
    this.otForm.reset();
    this.showForm = true;
    this.message = null;
  }

  clearForm(): void {
    this.otForm.reset();
    this.selectedOt = null;
    this.showForm = false;
    this.message = null;
  }

  onSubmit(): void {
    if (this.otForm.valid) {
      this.selectedOt ? this.updateOt() : this.createOt();
    }
  }

  createOt(): void {
    this.otService.create(this.otForm.value).subscribe({
      next: (newOt) => {
        this.ots.push(newOt);
        this.message = 'OT creada exitosamente';
        this.updatePagination();
        this.clearForm();
      },
      error: () => this.message = 'Error al crear la OT'
    });
  }

  updateOt(): void {
    if (this.selectedOt) {
      this.otService.update(this.selectedOt.id_ot, this.otForm.value).subscribe({
        next: (updatedOt) => {
          const index = this.ots.findIndex(ot => ot.id_ot === updatedOt.id_ot);
          if (index !== -1) {
            this.ots[index] = updatedOt;
          }
          this.message = 'OT actualizada exitosamente';
          this.updatePagination();
          this.clearForm();
        },
        error: () => this.message = 'Error al actualizar la OT'
      });
    }
  }

  deleteOt(id: number): void {
    this.otService.delete(id).subscribe({
      next: () => {
        this.ots = this.ots.filter(ot => ot.id_ot !== id);
        this.message = 'OT eliminada exitosamente';
        this.updatePagination();
      },
      error: () => this.message = 'Error al eliminar la OT'
    });
  }

  editOt(ot: Ot): void {
    this.selectedOt = ot;
    this.otForm.patchValue(ot);
    this.showForm = true;
  }
}
