import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    // MP con hash routing agrega params antes del #, leerlos de window.location.search
    const urlParams = new URLSearchParams(window.location.search);

    this.route.queryParams.subscribe(params => {
      this.status = params['status'] || params['collection_status']
        || urlParams.get('status') || urlParams.get('collection_status') || null;
      this.paymentId = params['payment_id'] || params['collection_id']
        || urlParams.get('payment_id') || urlParams.get('collection_id') || null;
      this.orderId = params['external_reference']
        || urlParams.get('external_reference') || null;
    });
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