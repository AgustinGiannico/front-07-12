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
        this.ots = ots
          .filter((ot) => ot.username === username)
          .map((ot) => ({
            ...ot,
            request_date: this.formatDateToDDMMYYYY(ot.request_date),
            initial_date: ot.initial_date ? this.formatDateToDDMMYYYY(ot.initial_date) : 'Sin fecha',
            completion_date: ot.completion_date ? this.formatDateToDDMMYYYY(ot.completion_date) : 'Sin fecha'
          }));
        this.updatePagination();
      },
      error: () => {
        this.message = 'Error al cargar las órdenes de trabajo.';
      }
    });
  }

  startTask(ot: Ot): void {
    const today = this.getFormattedDateForUpdate();
    const updatedOt = {
      initial_date: today,
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
    const completionTime = prompt(
      `Por favor, ingrese el tiempo total utilizado (en minutos) para la OT con número de orden ${ot.order_number}:`
    );

    if (completionTime !== null) {
      const today = this.getFormattedDateForUpdate();
      const updatedOt = {
        completion_date: today,
        completion_time: Number(completionTime),
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

  private getFormattedDateForUpdate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Formato para la base de datos
  }

  private formatDateToDDMMYYYY(date: string | Date): string {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
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
}
