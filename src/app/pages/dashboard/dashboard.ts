import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service/dashboard';
import { AuthService } from '../../core/services/auth.service/auth';
import { AdminLayoutComponent } from '../../layout/admin-layout/admin-layout';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  // Métricas
  metricas: any = null;
  cargandoMetricas = false;

  // Filtros
  filtros = {
    desde: this.hoyString(),
    hasta: this.hoyString(),
    direccion: '',
    zona: null as number | null,
    formaPago: '',
    estado: ''
  };

  // Tabla
  pedidos: any[] = [];
  totalRegistros = 0;
  totalPaginas = 0;
  paginaActual = 1;
  tamañoPagina = 50;
  cargandoPedidos = false;

  constructor(
    private dashboardService: DashboardService,
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarMetricas();
    this.cargarPedidos();
  }

  hoyString(): string {
    return new Date().toISOString().split('T')[0];
  }

  cargarMetricas(): void {
    this.cargandoMetricas = true;
    this.dashboardService.getMetricas().subscribe({
      next: (response) => {
        this.cargandoMetricas = false;
        if (response.success) this.metricas = response.data;
      },
      error: () => this.cargandoMetricas = false
    });
  }

  cargarPedidos(): void {
    this.cargandoPedidos = true;
    this.dashboardService.filtrarPedidos({
      ...this.filtros,
      zona: this.filtros.zona || undefined,
      pagina: this.paginaActual,
      tamañoPagina: this.tamañoPagina
    }).subscribe({
      next: (response) => {
        this.cargandoPedidos = false;
        if (response.success) {
          this.pedidos = response.data.items;
          this.totalRegistros = response.data.totalRegistros;
          this.totalPaginas = response.data.totalPaginas;
        }
      },
      error: () => this.cargandoPedidos = false
    });
  }

  filtrar(): void {
    this.paginaActual = 1;
    this.cargarPedidos();
  }

  limpiarFiltros(): void {
    this.filtros = {
      desde: this.hoyString(),
      hasta: this.hoyString(),
      direccion: '',
      zona: null,
      formaPago: '',
      estado: ''
    };
    this.paginaActual = 1;
    this.cargarPedidos();
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.cargarPedidos();
  }

  exportarExcel(): void {
    this.dashboardService.filtrarPedidos({
      ...this.filtros,
      zona: this.filtros.zona || undefined,
      pagina: 1,
      tamañoPagina: 10000
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.dashboardService.exportarExcel(response.data.items);
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatMonto(monto: string): string {
    if (!monto) return '$0';
    return `$${parseFloat(monto).toLocaleString('es-AR')}`;
  }
}