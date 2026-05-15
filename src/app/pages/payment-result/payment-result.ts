import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service/payment.service';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-result.html',
  styleUrls: ['./payment-result.css']
})
export class PaymentResultComponent implements OnInit {

  status: string | null = null;
  paymentId: string | null = null;
  orderId: string | null = null;
  descargando = false;

  constructor(
    private router: Router,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    // MP puede agregar params antes O después del # según la versión
    const beforeHash = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const afterHash = hash.includes('?')
      ? new URLSearchParams(hash.substring(hash.indexOf('?') + 1))
      : new URLSearchParams();

    const get = (...keys: string[]): string | null => {
      for (const k of keys) {
        const v = beforeHash.get(k) || afterHash.get(k);
        if (v) return v;
      }
      return null;
    };

    this.status = get('status', 'collection_status');
    this.paymentId = get('payment_id', 'collection_id');
    this.orderId = get('external_reference');
  }

  descargarComprobante(): void {
    if (!this.orderId) return;
    this.descargando = true;
    this.paymentService.downloadReceipt(Number(this.orderId)).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `comprobante-pedido-${this.orderId}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        this.descargando = false;
      },
      error: () => this.descargando = false
    });
  }

  volverInicio(): void {
    this.router.navigate(['/pedido']);
  }
}