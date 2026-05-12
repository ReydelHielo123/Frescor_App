import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service/auth';
import { environment } from '../../../environments/environment';
import { AdminLayoutComponent } from '../../layout/admin-layout/admin-layout';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css']
})
export class ProductosComponent implements OnInit {

  precios: any[] = [];
  cargando = false;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarPrecios();
  }

  cargarPrecios(): void {
    this.cargando = true;
    this.http.get<any>(`${environment.apiUrl}/price`).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.success) {
          this.precios = response.data.map((p: any) => ({
            ...p,
            precioEditado: p.precio1
          }));
        }
      },
      error: () => this.cargando = false
    });
  }

  guardarPrecio(precio: any): void {
    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    const body = {
      id: precio.id,
      tipoBolsa: precio.tipoBolsa,
      cantidadBolsa: precio.cantidadBolsa,
      precio1: parseFloat(precio.precioEditado)
    };

    this.http.put<any>(`${environment.apiUrl}/price/${precio.id}`, body).subscribe({
      next: (response) => {
        this.guardando = false;
        if (response.success) {
          precio.precio1 = precio.precioEditado;
          this.mensajeExito = `Precio de ${precio.tipoBolsa} actualizado correctamente.`;
          setTimeout(() => this.mensajeExito = '', 3000);
        }
      },
      error: () => {
        this.guardando = false;
        this.mensajeError = 'Error al actualizar el precio.';
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
  }
}