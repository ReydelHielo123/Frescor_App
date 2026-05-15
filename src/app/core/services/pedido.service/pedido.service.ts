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

  insertarPedido(pedido: IPedido): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, pedido);
  }

  obtenerPedidoPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/${id}`);
  }

}
