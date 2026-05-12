import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPedido } from '../../model/pedido/i-pedido';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7175/api';

  insertarPedido(pedido: IPedido): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, pedido);
  }

}
