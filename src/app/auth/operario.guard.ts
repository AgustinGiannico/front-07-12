import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { EnviarDatosService } from './enviar-datos.service';

@Injectable({
  providedIn: 'root',
})
export class OperarioGuard implements CanActivate {
  constructor(private enviarDatosService: EnviarDatosService, private router: Router) {}

  canActivate(): boolean {
    const role = this.enviarDatosService.getUserRole();
    if (role === 'operario') {
      console.log('Acceso concedido al operario');
      return true; // El usuario es operario, acceso concedido
    } else {
      console.warn('Acceso denegado. Redirigiendo a login');
      this.router.navigate(['/login']);
      return false; // Acceso denegado
    }
  }
}