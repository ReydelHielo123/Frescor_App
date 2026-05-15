import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../../model/ApiResponse/ApiResponse';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;;

  crearPreferencia(total: number, orderId: number) {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/payment/CreatePreference`,
      { total, orderId }
    );
  }

  downloadReceipt(orderId: number) {
    return this.http.get(
      `${this.apiUrl}/payment/GenerateReceipt?orderId=${orderId}`,
      { responseType: 'blob' }
    );
  }

}