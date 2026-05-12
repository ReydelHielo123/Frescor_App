import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminLayoutComponent } from '../../layout/admin-layout/admin-layout';
import { AuthService } from '../../core/services/auth.service/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.css']
})
export class ClientesComponent implements OnInit {

  clientes: any[] = [];
  cargando = false;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  // Confirmación eliminar
  modalEliminarAbierto = false;
  clienteAEliminar: any = null;

  // Filtros
  filtros = { telefono: '', direccion: '', zona: null as number | null };

  // Paginado
  totalRegistros = 0;
  totalPaginas = 0;
  paginaActual = 1;
  tamañoPagina = 20;

  // Modal
  modalAbierto = false;
  modoEdicion = false;
  clienteForm: any = this.nuevoClienteForm();

  constructor(private http: HttpClient, public authService: AuthService) { }

  ngOnInit(): void {
    this.cargarClientes();
  }

  nuevoClienteForm() {
    return {
      id: null,
      telefono: '',
      direccion: '',
      direccionMayusculas: '',
      zona: null,
      cuponDescuento: 0,
      nombreCupon: '',
      otrosMediosPago: ''
    };
  }

  cargarClientes(): void {
    this.cargando = true;
    let params = `pagina=${this.paginaActual}&tamañoPagina=${this.tamañoPagina}`;
    if (this.filtros.telefono) params += `&telefono=${this.filtros.telefono}`;
    if (this.filtros.direccion) params += `&direccion=${this.filtros.direccion}`;
    if (this.filtros.zona) params += `&zona=${this.filtros.zona}`;

    this.http.get<any>(`${environment.apiUrl}/clientdata/todos?${params}`).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.success) {
          this.clientes = response.data.items;
          this.totalRegistros = response.data.totalRegistros;
          this.totalPaginas = response.data.totalPaginas;
        }
      },
      error: () => this.cargando = false
    });
  }

  filtrar(): void {
    this.paginaActual = 1;
    this.cargarClientes();
  }

  limpiarFiltros(): void {
    this.filtros = { telefono: '', direccion: '', zona: null };
    this.paginaActual = 1;
    this.cargarClientes();
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.cargarClientes();
  }

  abrirNuevo(): void {
    this.clienteForm = this.nuevoClienteForm();
    this.modoEdicion = false;
    this.modalAbierto = true;
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  abrirEdicion(cliente: any): void {
    this.clienteForm = {
      ...cliente,
      otrosMediosPago: cliente.otrosMediosPago === '1' || cliente.otrosMediosPago === 1
    };
    this.modoEdicion = true;
    this.modalAbierto = true;
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  guardar(): void {
    if (!this.clienteForm.telefono || !this.clienteForm.direccion) {
      this.mensajeError = 'Teléfono y dirección son obligatorios.';
      return;
    }

    this.guardando = true;
    this.mensajeError = '';

    if (this.modoEdicion) {
      const body = {
        id: this.clienteForm.id,
        telefono: this.clienteForm.telefono,
        direccion: this.clienteForm.direccion,
        direccionMayusculas: this.clienteForm.direccion?.toUpperCase(),
        zona: this.clienteForm.zona,
        cuponDescuento: this.clienteForm.cuponDescuento || 0,
        nombreCupon: this.clienteForm.cuponDescuento ? this.clienteForm.nombreCupon : 'Sin Descuento',
        otrosMediosPago: this.clienteForm.otrosMediosPago ? '1' : null
      };

      this.http.put<any>(`${environment.apiUrl}/clientdata/${this.clienteForm.id}`, body).subscribe({
        next: (response) => {
          this.guardando = false;
          if (response.success) {
            this.mensajeExito = 'Cliente actualizado correctamente.';
            this.modalAbierto = false;
            this.cargarClientes();
            setTimeout(() => this.mensajeExito = '', 3000);
          }
        },
        error: () => {
          this.guardando = false;
          this.mensajeError = 'Error al actualizar el cliente.';
        }
      });
    } else {
      // Sin id para que el backend lo genere automáticamente
      const body = {
        telefono: this.clienteForm.telefono,
        direccion: this.clienteForm.direccion,
        direccionMayusculas: this.clienteForm.direccion?.toUpperCase(),
        zona: this.clienteForm.zona,
        cuponDescuento: this.clienteForm.cuponDescuento || 0,
        nombreCupon: this.clienteForm.cuponDescuento ? this.clienteForm.nombreCupon : 'Sin Descuento',
        otrosMediosPago: this.clienteForm.otrosMediosPago ? '1' : null
      };

      this.http.post<any>(`${environment.apiUrl}/clientdata`, body).subscribe({
        next: (response) => {
          this.guardando = false;
          if (response.success) {
            this.mensajeExito = 'Cliente creado correctamente.';
            this.modalAbierto = false;
            this.cargarClientes();
            setTimeout(() => this.mensajeExito = '', 3000);
          }
        },
        error: () => {
          this.guardando = false;
          this.mensajeError = 'Error al crear el cliente.';
        }
      });
    }
  }

  confirmarEliminar(cliente: any): void {
    this.clienteAEliminar = cliente;
    this.modalEliminarAbierto = true;
  }

  cancelarEliminar(): void {
    this.modalEliminarAbierto = false;
    this.clienteAEliminar = null;
  }

  eliminar(): void {
    if (!this.clienteAEliminar) return;

    this.http.delete<any>(`${environment.apiUrl}/clientdata/${this.clienteAEliminar.id}`).subscribe({
      next: (response) => {
        this.modalEliminarAbierto = false;
        this.clienteAEliminar = null;
        if (response.success) {
          this.mensajeExito = 'Cliente eliminado correctamente.';
          this.cargarClientes();
          setTimeout(() => this.mensajeExito = '', 3000);
        }
      },
      error: () => {
        this.modalEliminarAbierto = false;
        this.mensajeError = 'Error al eliminar el cliente.';
      }
    });
  }
}