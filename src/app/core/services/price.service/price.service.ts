import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../model/ApiResponse/ApiResponse';
import { IPrecio } from '../../model/precio/i-precio';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PriceService {
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;;

  obtenerPrecios(): Observable<ApiResponse<IPrecio[]>> {
    return this.http.get<ApiResponse<IPrecio[]>>(
      `${this.apiUrl}/price`
    );
  }

  obtenerCupon(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/cupones/${id}`
    );
  }
}
