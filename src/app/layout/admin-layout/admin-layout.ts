import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service/auth';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css']
})
export class AdminLayoutComponent {

  menuAbierto = false;

  constructor(public authService: AuthService, private router: Router) { }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  logout(): void {
    this.authService.logout();
  }

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
    this.menuAbierto = false;
  }

  estaActivo(ruta: string): boolean {
    return this.router.url === ruta || this.router.url.startsWith(ruta);
  }
}