import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PedidoService } from '../../core/services/pedido.service/pedido.service';

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

  constructor(private router: Router, private pedidoService: PedidoService) { }

  ngOnInit(): void {
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

    this.pedidoService.obtenerPedidoPorId(Number(this.orderId)).subscribe({
      next: (response) => {
        if (response.success) this.generarPDF(response.data);
      }
    });
  }

  private generarPDF(p: any): void {
    import('jspdf').then(({ jsPDF }) => {
      const fecha = new Date(p.fecha_Carga).toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });

      const doc = new jsPDF();

      const img = new Image();
      img.src = 'logo-frescor.jpeg';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg');

        doc.setFillColor(4, 44, 83);
        doc.rect(0, 0, 210, 45, 'F');
        doc.addImage(base64, 'JPEG', 88, 5, 35, 35);

        doc.setDrawColor(211, 209, 199);
        doc.line(15, 50, 195, 50);

        doc.setTextColor(4, 44, 83);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`Pedido #${p.id}`, 105, 62, { align: 'center' });

        doc.setDrawColor(211, 209, 199);
        doc.line(15, 67, 195, 67);

        let y = 77;
        doc.setFontSize(10);

        const addRow = (label: string, value: string) => {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(68, 68, 65);
          doc.text(label, 15, y);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(44, 44, 42);
          doc.text(value, 80, y);
          y += 8;
        };

        addRow('Fecha:', fecha);
        addRow('Dirección:', p.direccion || '');
        addRow('Zona:', `${p.zona}`);
        addRow('Forma de pago:', p.formaPago === 'mercadopago' ? 'Mercado Pago' : 'Efectivo');
        if (p.paymentId) addRow('Payment ID:', p.paymentId);
        addRow('Estado:', p.estado === 'Pagado' ? 'Pagado' : 'Pendiente de pago');

        y += 5;
        doc.line(15, y, 195, y);
        y += 10;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(4, 44, 83);
        doc.setFontSize(12);
        doc.text('Productos', 15, y);
        y += 8;

        doc.setFontSize(10);
        doc.setTextColor(44, 44, 42);

        if (p.kg1_5 > 0) { doc.text(`Bolsas 1,5kg`, 20, y); doc.text(`${p.kg1_5} unidades`, 150, y); y += 7; }
        if (p.kg2_5 > 0) { doc.text(`Bolsas 2,5kg`, 20, y); doc.text(`${p.kg2_5} unidades`, 150, y); y += 7; }
        if (p.kg4_5 > 0) { doc.text(`Bolsas 4,5kg`, 20, y); doc.text(`${p.kg4_5} unidades`, 150, y); y += 7; }
        if (p.kg10_5 > 0) { doc.text(`Bolsas 10kg`, 20, y); doc.text(`${p.kg10_5} unidades`, 150, y); y += 7; }
        if (p.triturado > 0) { doc.text(`Triturado 10kg`, 20, y); doc.text(`${p.triturado} unidades`, 150, y); y += 7; }

        y += 5;
        doc.line(15, y, 195, y);
        y += 10;

        doc.setFillColor(29, 158, 117);
        doc.rect(15, y - 3, 180, 14, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text('TOTAL:', 20, y + 7);
        doc.text(`$${parseFloat(p.precio_Total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, 185, y + 7, { align: 'right' });

        y += 25;
        doc.setFontSize(9);
        doc.setTextColor(95, 94, 90);
        doc.setFont('helvetica', 'normal');
        doc.text('Gracias por su pedido. Hielo Fres-Cor - Córdoba, Argentina', 105, y, { align: 'center' });

        doc.save(`comprobante-pedido-${p.id}.pdf`);
      };
    });
  }

  volverInicio(): void {
    this.router.navigate(['/pedido']);
  }
}
