import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../app/auth/auth.guard';
import { AdminGuard } from './auth/admin.guard';
import { RegistroComponent } from './pages/registro/registro.component';
import { LoginComponent } from './pages/login/login.component';
import { LaunchpadComponent } from './pages/launchpad/launchpad.component';
import { GestionOrdenesComponent } from './pages/gestion-ordenes/gestion-ordenes.component';
import { GestionInfraestructuraComponent } from './pages/gestion-infraestructura/gestion-infraestructura.component';
import { GestionOperariosComponent } from './pages/gestion-operarios/gestion-operarios.component';
import { EdificeComponent } from './components/edifice/edifice.component';
import { FloorComponent } from './components/floor/floor.component';
import { SectorComponent } from './components/sector/sector.component';
import { SiteComponent } from './components/site/site.component';
import { AssetTypeComponent } from './components/asset-type/asset-type.component';
import { TagComponent } from './components/tag/tag.component';
import { TaskComponent } from './components/task/task.component';
import { TaskTypeComponent } from './components/task-type/task-type.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { OtComponent } from './components/ot/ot.component';
import { OtOperarioComponent } from './components/ot-operario/ot-operario.component';
import { CrearOrdenComponent } from './components/crear-orden/crear-orden.component';
import { LogoutComponent } from './components/logout/logout.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

const routes: Routes = [

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: '',
    component: LaunchpadComponent
  },

  {
    path: 'registro',
    component: RegistroComponent,
    canActivate: [AdminGuard]
  },

  {
    path: 'logout',
    component: LogoutComponent
  },
  {
    path: 'gestion-ordenes',
    component: GestionOrdenesComponent
  },
  {
    path: 'gestion-infraestructura',
    component: GestionInfraestructuraComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'gestion-operarios',
    component: GestionOperariosComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'edificio',
    component: EdificeComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'piso',
    component: FloorComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'sector',
    component: SectorComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'ubicacion',
    component: SiteComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'tipo-activo',
    component: AssetTypeComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'tag',
    component: TagComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'task',
    component: TaskComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'task-type',
    component: TaskTypeComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'task-list',
    component: TaskListComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'ver-ordenes',
    component: OtComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'ver-mis-ordenes',
    component: OtOperarioComponent
  },
  {
    path: 'crear-orden',
    component: CrearOrdenComponent,
    canActivate: [AdminGuard]
  },

  {
    path: '**', component: NotFoundComponent
 }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
