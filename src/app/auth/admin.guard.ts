import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { EnviarDatosService } from './enviar-datos.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private enviarDatosService: EnviarDatosService, private router: Router) {}

  canActivate(): boolean {
    const role = this.enviarDatosService.getUserRole();
    console.log('Rol del usuario desde el guard:', role); // Log para verificar el rol
    if (role === 'admin') {
      console.log('Acceso concedido al administrador.');
      return true;
    } else {
      console.warn('Acceso denegado. Redirigiendo al login.');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
