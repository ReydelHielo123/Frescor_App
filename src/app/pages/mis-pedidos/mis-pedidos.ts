import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PedidoService } from '../../core/services/pedido.service/pedido.service';
import { IPedidoReciente } from '../../core/model/pedido/i-pedido-reciente';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mis-pedidos.html',
  styleUrl: './mis-pedidos.css'
})
export class MisPedidos {
  private service = inject(PedidoService);
  private destroyRef = inject(DestroyRef);
  telefono = '';
  cargando = signal(false);
  error = signal('');
  consultado = signal(false);
  pedidos = signal<IPedidoReciente[]>([]);
  pagina = signal(1);
  totalPaginas = signal(0);
  telefonoConsultado = '';
  desde = '';
  hasta = '';

  buscar(): void {
    if (this.cargando()) return;
    this.error.set('');
    this.consultado.set(false);
    this.pedidos.set([]);
    const telefono = this.telefono.replace(/[\s()+.-]/g, '');
    if (!/^\d{10,15}$/.test(telefono)) {
      this.error.set('Ingresá un teléfono válido de entre 10 y 15 dígitos, con código de área.');
      return;
    }
    this.telefonoConsultado = telefono;
    this.cargar(1);
  }

  cargar(pagina: number): void {
    if (this.cargando() || pagina < 1) return;
    this.cargando.set(true);
    this.error.set('');
    this.service.obtenerPedidosRecientes(this.telefonoConsultado, pagina).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        this.cargando.set(false);
        if (!response.success || !Array.isArray(response.data?.items)) {
          this.error.set('No pudimos consultar tus pedidos. Intentá nuevamente.');
          return;
        }
        this.pedidos.set(response.data.items);
        this.desde = response.data.desde;
        this.hasta = response.data.hasta;
        this.pagina.set(pagina);
        this.totalPaginas.set(response.data.totalPaginas || 1);
        this.consultado.set(true);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No pudimos conectarnos para consultar tus pedidos. Intentá nuevamente.');
      }
    });
  }

  estado(estado: string): string {
    const etiquetas: Record<string, string> = {
      Pagado: 'Pagado', PendientePago: 'Pago pendiente', PagoPendiente: 'Pago pendiente', PagoRechazado: 'Pago rechazado'
    };
    return etiquetas[estado] || estado || 'Pendiente';
  }

  productos(pedido: IPedidoReciente): string[] {
    return ([['kg1_5', 'Bolsas de 1,5 kg'], ['kg2_5', 'Bolsas de 2,5 kg'],
      ['kg4_5', 'Bolsas de 4,5 kg'], ['kg10_5', 'Bolsas de 10 kg'],
      ['triturado', 'Triturado de 10 kg']] as const)
      .filter(([campo]) => pedido[campo] > 0)
      .map(([campo, nombre]) => `${pedido[campo]} × ${nombre}`);
  }

}
