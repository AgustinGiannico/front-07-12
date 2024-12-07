import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { OtService } from '../../services/ot.service';
import { TagService } from '../../services/tag.service';
import { UserService } from '../../services/user.service';
import { AssetTypeService } from 'src/app/services/asset-type.service';
import { EdificeService } from 'src/app/services/edifice.service';
import { FloorService } from 'src/app/services/floor.service';
import { SectorService } from 'src/app/services/sector.service';
import { SiteService } from 'src/app/services/site.service';
import { PriorityService } from 'src/app/services/priority.service';
import { TaskTypeService } from 'src/app/services/task-type.service';
import { TaskListService } from 'src/app/services/task-list.service';
import { TaskList } from 'src/app/interfaces/task-list';
import { Ot } from '../../interfaces/ot';
import { User } from '../../interfaces/user';
import { AssetType } from '../../interfaces/asset-type';
import { Tag } from '../../interfaces/tag';
import { Priority } from '../../interfaces/priority';
import { Edifice } from '../../interfaces/edifice';
import { Floor } from '../../interfaces/floor';
import { Sector } from '../../interfaces/sector';
import { Site } from '../../interfaces/site';
import { TaskType } from '../../interfaces/task-type';
import { TaskService } from '../../services/task.service';
import { Task } from '../../interfaces/task';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-gestion-ordenes',
  templateUrl: './crear-orden.component.html',
  styleUrls: ['./crear-orden.component.css']
})
export class CrearOrdenComponent implements OnInit {
  ordenes: Ot[] = [];
  users: User[] = [];
  assetTypes: AssetType[] = [];
  priorities: Priority[] = [];
  edifices: Edifice[] = [];
  sectors: Sector[] = [];
  sites: Site[] = [];
  floors: Floor[] = [];
  taskLists: TaskList[] = [];
  taskTypes: TaskType[] = [];
  user: User[] = [];
  allTags: Tag[] = [];
  tasks: Task[] = [];
  selectedOt: Ot | null = {
    id_ot: 0,
    order_number: '',
    request_date: new Date(),
    initial_date: new Date(),
    completion_date: new Date(),
    observations: '',
    id_user: 0,
    id_task_list: 0,
    id_priority: 0,
    id_ot_state: 0,
    id_tag: 0,
    id_task_type: 0,
    id_asset_type: 0
  };
  selectedTag?: string;
  selectedAssetTypeName?: string;
  selectedEdificeName?: string;
  selectedFloorName?: string;
  selectedSector?: string;
  selectedSite?: string;
  selectedTaskListSteps: string[] = [];
  selectedPriority?: string;
  isEditing: boolean = false;
  selectedPriorityDescription: string = 'No asignado';
  selectedTaskTypeDescription: string = 'No asignado';
  selectedUser?: string;

  @Output() ordenCreada = new EventEmitter<Ot>();

  constructor(
    private otService: OtService,
    private tagService: TagService,
    private userService: UserService,
    private assetTypeService: AssetTypeService,
    private priorityService: PriorityService,
    private edificeService: EdificeService,
    private floorService: FloorService,
    private sectorService: SectorService,
    private siteService: SiteService,
    private taskTypeService: TaskTypeService,
    private taskService: TaskService,
    private taskListService: TaskListService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.getOrdenes();
    this.loadUsers();
    this.loadAssetTypes();
    this.loadPriorities();
    this.loadAllTags();
    this.loadEdifices();
    this.loadFloors();
    this.loadSectors();
    this.loadSites();
    this.loadTasks();
    this.loadTaskTypes();
  }


  goBack(): void {
    this.location.back();
  }

  getOrdenes(): void {
    this.otService.getAll().subscribe(data => this.ordenes = data);
  }

  loadUsers(): void {
    this.userService.getAll().subscribe(data => this.users = data);
  }

  getOperarioName(): string {
    const operario = this.users.find(user => user.id_user === this.selectedOt?.id_user);
    console.log("Operario encontrado:", operario);
    return operario ? operario.username : 'No asignado';
  }

  loadAssetTypes(): void {
    this.assetTypeService.getAll().subscribe(data => this.assetTypes = data);
  }

  loadAllTags(): void {
    this.tagService.getAll().subscribe(tags => this.allTags = tags);
  }

  loadEdifices(): void {
    this.edificeService.getAll().subscribe({
      next: (data) => {
        this.edifices = data;
        console.log("Edifices Loaded:", this.edifices);
      },
      error: (err) => {
        console.error("Error al cargar los edificios:", err);
      }
    });
  }

  loadFloors(): void {
    this.floorService.getAll().subscribe(data => this.floors = data);
  }

  loadSectors(): void {
    this.sectorService.getAll().subscribe(data => this.sectors = data);
  }

  loadSites(): void {
    this.siteService.getAll().subscribe(data => this.sites = data);
  }

  loadTasks(): void {
    this.taskService.getAll().subscribe(data => {
      this.tasks = data;
      console.log("Tasks Loaded:", this.tasks);
    });
  }

  loadPriorities(): Promise<void> {
    return new Promise((resolve) => {
      this.priorityService.getAll().subscribe(data => {
        this.priorities = data;
        console.log("Prioridades cargadas:", this.priorities);
        this.onPriorityChange();
        resolve();
      });
    });
  }

  loadTaskTypes(): Promise<void> {
    return new Promise((resolve) => {
      this.taskTypeService.getAll().subscribe(data => {
        this.taskTypes = data;
        console.log("Tipos de tarea cargados:", this.taskTypes);
        resolve();
      });
    });
  }

  onTagChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedTag = this.allTags.find(tag => tag.final_tag === target.value);

    if (selectedTag) {
      this.selectedOt!.id_tag = selectedTag.id_tag;
      this.selectedTag = selectedTag.final_tag;
      this.selectedAssetTypeName = selectedTag.asset_type;
      this.selectedEdificeName = selectedTag.edifice;
      this.selectedFloorName = selectedTag.floor;
      this.selectedSector = selectedTag.sector;
      this.selectedSite = selectedTag.site;

      const assetType = this.assetTypes.find(type => type.name === this.selectedAssetTypeName);
      if (assetType) {
        this.selectedOt!.id_asset_type = assetType.id_asset_type;
        console.log("id_asset_type asignado:", this.selectedOt!.id_asset_type);
      }

      this.updateTaskList();
    }
  }

  onTaskTypeChange(): void {
    const selectedTaskTypeId = Number(this.selectedOt?.id_task_type);
    const taskType = this.taskTypes.find(tt => tt.id_task_type === selectedTaskTypeId);

    this.selectedTaskTypeDescription = taskType ? taskType.name : 'No asignado';
    this.updateTaskList();
  }

  updateTaskList(): void {
    if (this.selectedOt?.id_asset_type && this.selectedOt?.id_task_type) {
      const assetTypeId = this.selectedOt.id_asset_type;
      const taskTypeId = this.selectedOt.id_task_type;
      console.log("Enviando para obtener la lista de tareas:", { assetTypeId, taskTypeId });
      this.loadTaskList(assetTypeId, taskTypeId);
    } else {
      console.error("Faltan datos de id_asset_type o id_task_type para cargar la lista de tareas.");
    }
  }

  loadTaskList(assetTypeId: number, taskTypeId: number): void {
    this.taskListService.getFilteredTaskList(assetTypeId, taskTypeId).subscribe({
      next: (taskLists) => {
        if (taskLists.length > 0) {
          const taskList = taskLists[0];
          this.selectedOt!.id_task_list = taskList.id_task_list;
          this.selectedTaskListSteps = [
            taskList.step_1,
            taskList.step_2,
            taskList.step_3,
            taskList.step_4,
            taskList.step_5,
            taskList.step_6,
            taskList.step_7,
            taskList.step_8,
            taskList.step_9,
            taskList.step_10
          ].filter((step) => step);
          console.log("Pasos de la lista de tareas seleccionada:", this.selectedTaskListSteps);
          console.log("ID de Task List asignado a selectedOt:", this.selectedOt!.id_task_list);
        } else {
          this.selectedTaskListSteps = [];
          this.selectedOt!.id_task_list = 0;
          console.log("No se encontró ninguna lista de tareas para los criterios seleccionados.");
        }
      },
      error: (error) => {
        console.error("Error al cargar la lista de tareas:", error);
      }
    });
  }

  onPriorityChange(): void {
    console.log("ID de prioridad seleccionada:", this.selectedOt?.id_priority);
    console.log("Prioridades actuales:", this.priorities);
    const selectedPriorityId = +this.selectedOt?.id_priority!;
    const priority = this.priorities.find(p => +p.id_priority === selectedPriorityId);
    this.selectedPriorityDescription = priority ? priority.description : 'No asignado';
    console.log("Descripción de la prioridad seleccionada en onPriorityChange:", this.selectedPriorityDescription);
  }

  
  createOt(): void {
    if (this.selectedOt) {
        // Asignar automáticamente la fecha de solicitud como objeto Date
        const currentDate = new Date();
        this.selectedOt.request_date = currentDate;


        console.log("Datos enviados al backend:", this.selectedOt);

        // Crear la OT a través del servicio
        this.otService.create(this.selectedOt).subscribe({
            next: (newOt) => {
                this.ordenCreada.emit(newOt);
                this.resetForm();
                console.log("OT creada exitosamente en la base de datos:", newOt);
            },
            error: (err) => console.error("Error al guardar la OT:", err),
        });
    }
}
  


  createOrUpdateOt(): void {
    this.onPriorityChange();


    if (!this.selectedOt?.id_ot) {
      this.otService.create(this.selectedOt!).subscribe({
        next: (newOt) => {
          this.ordenCreada.emit(newOt);
          this.resetForm();
          console.log("OT creada exitosamente en la base de datos:", newOt);
        },
        error: (err) => console.error("Error al guardar la OT:", err)
      });
    } else {
      console.error("ID de OT ya existe, no se puede crear nuevamente.");
    }
  }

  generatePdfOnly(): void {
    this.generatePDF();
  }

  resetForm(): void {
    this.selectedOt = {
      id_ot: 0,
      order_number: '',
      request_date: new Date(),
      initial_date: new Date(),
      completion_date: new Date(),
      observations: '',
      id_user: 0,
      id_task_list: 0,
      id_priority: 0,
      id_ot_state: 1,
      id_tag: 0,
      id_task_type: 0,
      id_asset_type: 0,
    };
    this.isEditing = false;
    this.selectedAssetTypeName = '';
    this.selectedEdificeName = '';
    this.selectedFloorName = '';
    this.selectedSector = '';
    this.selectedSite = '';
    this.selectedTaskListSteps = [];
  }

  getTaskTypeName(id: number | null): string {
    const taskType = this.taskTypes.find(tt => tt.id_task_type === id);
    return taskType ? taskType.name : 'No asignado';
  }

  generatePDF(): void {
    const doc = new jsPDF();
    const fechaImpresion = new Date().toLocaleDateString();
    const operario = this.getOperarioName();
    const tiempoTotalUtilizado = 'Pendiente de cálculo';

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Orden de Trabajo', 70, 5);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Código Único de Identificación de Activo: ${this.selectedTag || 'No asignado'}`, 20, 25);
    doc.text(`Tipo de Activo: ${this.selectedAssetTypeName || 'No asignado'}`, 20, 35);
    doc.text(`OT N°: ${new Date().toISOString().slice(0, 10).replace(/-/g, '')} _ ${this.selectedOt?.id_task_type || ''} _ ${this.selectedTag || ''}`, 20, 15);

    doc.setFont('helvetica', 'bold');
    doc.text('Ubicación', 70, 45);
    doc.setFont('helvetica', 'normal');
    doc.text(`Edificio: ${this.selectedEdificeName || 'No asignado'}`, 20, 55);
    doc.text(`Piso / Nivel: ${this.selectedFloorName || 'No asignado'}`, 20, 65);
    doc.text(`Sector: ${this.selectedSector || 'No asignado'}`, 20, 75);

    doc.setFont('helvetica', 'bold');
    doc.text('Detalles de la Tarea', 70, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tipo de Tarea: ${this.selectedTaskTypeDescription || 'No asignado'}`, 20, 95);
    doc.text(`Prioridad: ${this.selectedPriorityDescription || 'No asignado'}`, 20, 105);
    doc.text(`Operario: ${operario}`, 20, 115);

    let startY = 135;
    autoTable(doc, {
      startY,
      head: [['Instrucciones de la Tarea']],
      body: this.selectedTaskListSteps.map(step => [step || '-']),
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [220, 220, 220] },
    });

    const finalY = startY + (this.selectedTaskListSteps.length * 10);
    const observationsText = this.selectedOt?.observations || 'Sin observaciones';
    const splitObservations = doc.splitTextToSize(observationsText, 170);

    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones', 70, finalY + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(splitObservations, 20, finalY + 20);

    doc.text(`Tiempo total utilizado: ${tiempoTotalUtilizado}`, 110, 115);
    doc.text(`Fecha de Impresión: ${fechaImpresion}`, 110, 35);

    doc.save('Orden_de_Trabajo.pdf');
  }
}
