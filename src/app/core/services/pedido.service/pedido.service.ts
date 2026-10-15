import { ApiResponse } from '../../model/ApiResponse/ApiResponse';
import { IPedidosRecientes } from '../../model/pedido/i-pedido-reciente';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPedido } from '../../model/pedido/i-pedido';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;;

  obtenerPedidosRecientes(telefono: string, pagina = 1): Observable<ApiResponse<IPedidosRecientes>> {
    return this.http.get<ApiResponse<IPedidosRecientes>>(`${this.apiUrl}/orders/recientes`, {
      params: { telefono, pagina, 'tamañoPagina': 10 }
    });
  }

  insertarPedido(pedido: IPedido): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, pedido);
  }

  obtenerPedidoPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/${id}`);
  }

}
