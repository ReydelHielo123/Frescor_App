import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminLayoutComponent } from '../../layout/admin-layout/admin-layout';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-zonas',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  templateUrl: './zonas.html',
  styleUrls: ['./zonas.css']
})
export class ZonasComponent implements OnInit {

  zonas: any[] = [];
  cargando = false;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  modalAbierto = false;
  modoEdicion = false;
  zonaForm: any = this.nuevaZonaForm();

  modalEliminarAbierto = false;
  zonaAEliminar: any = null;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.cargarZonas();
  }

  nuevaZonaForm() {
    return { id: null, zona1: null, barrio: '' };
  }

  cargarZonas(): void {
    this.cargando = true;
    this.http.get<any>(`${environment.apiUrl}/zonas`).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.success) this.zonas = response.data;
      },
      error: () => this.cargando = false
    });
  }

  abrirNuevo(): void {
    this.zonaForm = this.nuevaZonaForm();
    this.modoEdicion = false;
    this.modalAbierto = true;
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  abrirEdicion(zona: any): void {
    this.zonaForm = { ...zona };
    this.modoEdicion = true;
    this.modalAbierto = true;
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  guardar(): void {
    if (!this.zonaForm.zona1 || !this.zonaForm.barrio) {
      this.mensajeError = 'Número de zona y barrio son obligatorios.';
      return;
    }

    this.guardando = true;
    this.mensajeError = '';

    if (this.modoEdicion) {
      const body = {
        id: this.zonaForm.id,
        zona1: this.zonaForm.zona1,
        barrio: this.zonaForm.barrio
      };

      this.http.put<any>(`${environment.apiUrl}/zonas/${this.zonaForm.id}`, body).subscribe({
        next: (response) => {
          this.guardando = false;
          if (response.success) {
            this.mensajeExito = 'Zona actualizada correctamente.';
            this.modalAbierto = false;
            this.cargarZonas();
            setTimeout(() => this.mensajeExito = '', 3000);
          }
        },
        error: () => {
          this.guardando = false;
          this.mensajeError = 'Error al actualizar la zona.';
        }
      });
    } else {
      const body = {
        zona1: this.zonaForm.zona1,
        barrio: this.zonaForm.barrio
      };

      this.http.post<any>(`${environment.apiUrl}/zonas`, body).subscribe({
        next: (response) => {
          this.guardando = false;
          if (response.success) {
            this.mensajeExito = 'Zona creada correctamente.';
            this.modalAbierto = false;
            this.cargarZonas();
            setTimeout(() => this.mensajeExito = '', 3000);
          }
        },
        error: () => {
          this.guardando = false;
          this.mensajeError = 'Error al crear la zona.';
        }
      });
    }
  }

  confirmarEliminar(zona: any): void {
    this.zonaAEliminar = zona;
    this.modalEliminarAbierto = true;
  }

  cancelarEliminar(): void {
    this.modalEliminarAbierto = false;
    this.zonaAEliminar = null;
  }

  eliminar(): void {
    if (!this.zonaAEliminar) return;

    this.http.delete<any>(`${environment.apiUrl}/zonas/${this.zonaAEliminar.id}`).subscribe({
      next: (response) => {
        this.modalEliminarAbierto = false;
        this.zonaAEliminar = null;
        if (response.success) {
          this.mensajeExito = 'Zona eliminada correctamente.';
          this.cargarZonas();
          setTimeout(() => this.mensajeExito = '', 3000);
        }
      },
      error: () => {
        this.modalEliminarAbierto = false;
        this.mensajeError = 'Error al eliminar la zona.';
      }
    });
  }
}