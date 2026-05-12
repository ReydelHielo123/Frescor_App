import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminLayoutComponent } from '../../layout/admin-layout/admin-layout';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cupones',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  templateUrl: './cupones.html',
  styleUrls: ['./cupones.css']
})
export class CuponesComponent implements OnInit {

  cupones: any[] = [];
  cargando = false;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  // Confirmación eliminar
  modalEliminarAbierto = false;
  cuponAEliminar: any = null;

  filtros = { codigo: '', descripcion: '', porcentaje: null as number | null };

  totalRegistros = 0;
  totalPaginas = 0;
  paginaActual = 1;
  tamañoPagina = 20;

  modalAbierto = false;
  modoEdicion = false;
  cuponForm: any = this.nuevoCuponForm();

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.cargarCupones();
  }

  nuevoCuponForm() {
    return { id: null, codigo: '', porcentaje: 0, descripcion: '' };
  }

  cargarCupones(): void {
    this.cargando = true;
    let params = `pagina=${this.paginaActual}&tamañoPagina=${this.tamañoPagina}`;
    if (this.filtros.codigo) params += `&codigo=${this.filtros.codigo}`;
    if (this.filtros.descripcion) params += `&descripcion=${this.filtros.descripcion}`;
    if (this.filtros.porcentaje) params += `&porcentaje=${this.filtros.porcentaje}`;

    this.http.get<any>(`${environment.apiUrl}/cupones?${params}`).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.success) {
          this.cupones = response.data.items;
          this.totalRegistros = response.data.totalRegistros;
          this.totalPaginas = response.data.totalPaginas;
        }
      },
      error: () => this.cargando = false
    });
  }

  filtrar(): void {
    this.paginaActual = 1;
    this.cargarCupones();
  }

  limpiarFiltros(): void {
    this.filtros = { codigo: '', descripcion: '', porcentaje: null };
    this.paginaActual = 1;
    this.cargarCupones();
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.cargarCupones();
  }

  abrirNuevo(): void {
    this.cuponForm = this.nuevoCuponForm();
    this.modoEdicion = false;
    this.modalAbierto = true;
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  abrirEdicion(cupon: any): void {
    this.cuponForm = { ...cupon };
    this.modoEdicion = true;
    this.modalAbierto = true;
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  guardar(): void {
    if (!this.cuponForm.codigo) {
      this.mensajeError = 'El código es obligatorio.';
      return;
    }
    if (this.cuponForm.porcentaje < 0 || this.cuponForm.porcentaje > 100) {
      this.mensajeError = 'El porcentaje debe estar entre 0 y 100.';
      return;
    }

    this.guardando = true;
    this.mensajeError = '';

    if (this.modoEdicion) {
      const body = {
        id: this.cuponForm.id,
        codigo: this.cuponForm.codigo,
        porcentaje: this.cuponForm.porcentaje,
        descripcion: this.cuponForm.descripcion
      };

      this.http.put<any>(`${environment.apiUrl}/cupones/${this.cuponForm.id}`, body).subscribe({
        next: (response) => {
          this.guardando = false;
          if (response.success) {
            this.mensajeExito = 'Cupón actualizado correctamente.';
            this.modalAbierto = false;
            this.cargarCupones();
            setTimeout(() => this.mensajeExito = '', 3000);
          }
        },
        error: () => {
          this.guardando = false;
          this.mensajeError = 'Error al actualizar el cupón.';
        }
      });
    } else {
      const body = {
        codigo: this.cuponForm.codigo,
        porcentaje: this.cuponForm.porcentaje,
        descripcion: this.cuponForm.descripcion
      };

      this.http.post<any>(`${environment.apiUrl}/cupones`, body).subscribe({
        next: (response) => {
          this.guardando = false;
          if (response.success) {
            this.mensajeExito = 'Cupón creado correctamente.';
            this.modalAbierto = false;
            this.cargarCupones();
            setTimeout(() => this.mensajeExito = '', 3000);
          }
        },
        error: () => {
          this.guardando = false;
          this.mensajeError = 'Error al crear el cupón.';
        }
      });
    }
  }

  confirmarEliminar(cupon: any): void {
    this.cuponAEliminar = cupon;
    this.modalEliminarAbierto = true;
  }

  cancelarEliminar(): void {
    this.modalEliminarAbierto = false;
    this.cuponAEliminar = null;
  }

  eliminar(): void {
    if (!this.cuponAEliminar) return;

    this.http.delete<any>(`${environment.apiUrl}/cupones/${this.cuponAEliminar.id}`).subscribe({
      next: (response) => {
        this.modalEliminarAbierto = false;
        this.cuponAEliminar = null;
        if (response.success) {
          this.mensajeExito = 'Cupón eliminado correctamente.';
          this.cargarCupones();
          setTimeout(() => this.mensajeExito = '', 3000);
        }
      },
      error: () => {
        this.modalEliminarAbierto = false;
        this.mensajeError = 'Error al eliminar el cupón.';
      }
    });
  }
}