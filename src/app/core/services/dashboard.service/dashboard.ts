import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMetricas(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/orders/metricas`);
  }

  filtrarPedidos(filtros: {
    desde?: string;
    hasta?: string;
    direccion?: string;
    zona?: number;
    formaPago?: string;
    estado?: string;
    pagina?: number;
    tamañoPagina?: number;
  }): Observable<any> {
    let params = new URLSearchParams();

    if (filtros.desde) params.append('desde', filtros.desde);
    if (filtros.hasta) params.append('hasta', filtros.hasta);
    if (filtros.direccion) params.append('direccion', filtros.direccion);
    if (filtros.zona) params.append('zona', filtros.zona.toString());
    if (filtros.formaPago) params.append('formaPago', filtros.formaPago);
    if (filtros.estado) params.append('estado', filtros.estado);
    params.append('pagina', (filtros.pagina || 1).toString());
    params.append('tamañoPagina', (filtros.tamañoPagina || 50).toString());

    return this.http.get<any>(`${this.baseUrl}/orders/filtrar?${params.toString()}`);
  }

  exportarExcel(pedidos: any[]): void {
    const headers = ['ID', 'Dirección', 'Fecha', 'Kg1.5', 'Kg2.5', 'Kg10.5', 'Triturado', 'Kg4.5', 'Total', 'Zona', 'Forma de Pago', 'Estado'];

    const rows = pedidos.map(p => [
      p.id,
      `"${(p.direccion || '').replace(/"/g, '""')}"`,
      new Date(p.fecha_Carga).toLocaleDateString('es-AR'),
      p.kg1_5,
      p.kg2_5,
      p.kg10_5,
      p.triturado,
      p.kg4_5,
      p.precio_Total,
      p.zona,
      p.formaPago,
      p.estado
    ]);

    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedidos_${new Date().toLocaleDateString('es-AR').replace(/\//g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}