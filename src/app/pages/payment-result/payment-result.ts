import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

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

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.status = params['status'] || params['collection_status'] || null;
      this.paymentId = params['payment_id'] || params['collection_id'] || null;
      this.orderId = params['external_reference'] || null;
    });
  }

  volverInicio(): void {
    this.router.navigate(['/pedido']);
  }
}