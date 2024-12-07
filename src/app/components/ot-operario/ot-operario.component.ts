import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OtService } from '../../services/ot.service';
import { Ot } from '../../interfaces/ot';
import { EnviarDatosService } from '../../auth/enviar-datos.service';

@Component({
  selector: 'app-ot',
  templateUrl: './ot-operario.component.html',
  styleUrls: ['./ot-operario.component.css']
})
export class OtOperarioComponent implements OnInit {
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
    private enviarDatosService: EnviarDatosService, 
    private location: Location
  ) {
    this.otForm = this.fb.group({
      id_ot: [null],
      order_number: ['', Validators.required],
      request_date: ['', Validators.required],
      initial_date: [''],
      completion_date: [''],
      observations: [''],
      id_user: [null, Validators.required],
      id_task_list: [null, Validators.required],
      id_priority: [null, Validators.required],
      id_ot_state: [null, Validators.required],
      id_tag: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.getUserOts(); // Obtiene las órdenes del operario
  }

  goBack(): void {
    this.location.back();
  }

  getUserOts(): void {
    const username = this.enviarDatosService.getUsername(); // Obtén el nombre del usuario logueado
    if (!username) {
      this.message = 'No se pudo determinar el usuario logueado.';
      return;
    }
  
    this.otService.getAll().subscribe({
      next: (ots) => {
        // Filtrar las órdenes asignadas al usuario logueado
        this.ots = ots.filter(ot => ot.username === username);
        this.updatePagination();
      },
      error: () => {
        this.message = 'Error al cargar las órdenes de trabajo';
      }
    });
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

  clearForm(): void {
    this.otForm.reset();
    this.selectedOt = null;
    this.showForm = false;
    this.message = null;
  }
}
