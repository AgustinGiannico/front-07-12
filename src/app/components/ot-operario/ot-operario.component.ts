import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
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
  message: string | null = null;

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(
    private otService: OtService,
    private enviarDatosService: EnviarDatosService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.getUserOts();
  }

  goBack(): void {
    this.location.back();
  }

  getUserOts(): void {
    const username = this.enviarDatosService.getUsername();
    if (!username) {
      this.message = 'No se pudo determinar el usuario logueado.';
      return;
    }

    this.otService.getAll().subscribe({
      next: (ots) => {
        this.ots = ots.filter(ot => ot.username === username);
        this.updatePagination();
      },
      error: () => {
        this.message = 'Error al cargar las órdenes de trabajo.';
      }
    });
  }

  startTask(ot: Ot): void {
    const updatedOt = {
      initial_date: new Date().toISOString().slice(0, 19).replace('T', ' '), // Fecha actual en formato "YYYY-MM-DD HH:MM:SS"
      id_ot_state: 7 // Estado "En Progreso"
    };

    this.otService.update(ot.id_ot, updatedOt).subscribe({
      next: () => {
        this.message = `La tarea con número de orden ${ot.order_number} ha sido marcada como "En Progreso".`;
        this.getUserOts(); // Refresca la lista de OT
      },
      error: () => {
        this.message = 'Hubo un error al intentar iniciar la tarea.';
      }
    });
  }

  finishTask(ot: Ot): void {
    const completionTime = prompt(`Por favor, ingrese el tiempo total utilizado (en minutos) para la OT con número de orden ${ot.order_number}:`);

    if (completionTime !== null) {
      const updatedOt = {
        completion_date: new Date().toISOString().slice(0, 19).replace('T', ' '), // Fecha actual en formato "YYYY-MM-DD HH:MM:SS"
        completion_time: Number(completionTime), // Tiempo total ingresado
        id_ot_state: 8 // Estado "Finalizada"
      };

      this.otService.update(ot.id_ot, updatedOt).subscribe({
        next: () => {
          this.message = `La tarea con número de orden ${ot.order_number} ha sido marcada como "Finalizada".`;
          this.getUserOts(); // Refresca la lista de OT
        },
        error: () => {
          this.message = 'Hubo un error al intentar finalizar la tarea.';
        }
      });
    } else {
      this.message = 'No se ingresó tiempo de finalización. La tarea no se marcó como finalizada.';
    }
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
}
