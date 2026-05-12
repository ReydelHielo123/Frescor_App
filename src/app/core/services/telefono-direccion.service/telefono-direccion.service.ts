import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { iTelefonoDireccion } from '../../model/telefonoDireccion/i-telefono-direccion';
import { ApiResponse } from '../../model/ApiResponse/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class TelefonoDireccionService {
  private http = inject(HttpClient);

  private apiUrl = 'https://localhost:7175/api';


  obtenerDirecciones(telefono: string): Observable<ApiResponse<iTelefonoDireccion[]>> {
    return this.http.get<ApiResponse<iTelefonoDireccion[]>>(
      `${this.apiUrl}/ClientData?telefono=${telefono}`
    );
  }
}
