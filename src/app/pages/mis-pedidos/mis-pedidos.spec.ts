import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MisPedidos } from './mis-pedidos';
import { PedidoService } from '../../core/services/pedido.service/pedido.service';

describe('Consulta de pedidos del cliente', () => {
  const obtenerPedidosRecientes = vi.fn();
  let component: MisPedidos;
  beforeEach(() => {
    obtenerPedidosRecientes.mockReset();
    TestBed.configureTestingModule({ providers: [{ provide: PedidoService, useValue: { obtenerPedidosRecientes } }] });
    component = TestBed.runInInjectionContext(() => new MisPedidos());
  });
  afterEach(() => vi.useRealTimers());

  it('no consulta la API con un teléfono inválido', () => {
    component.telefono = '123';
    component.buscar();
    expect(obtenerPedidosRecientes).not.toHaveBeenCalled();
    expect(component.error()).toContain('teléfono válido');
  });

  it('normaliza el teléfono y usa el período devuelto por la API', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 5, 12));
    obtenerPedidosRecientes.mockReturnValue(of({ success: true, data: { items: [], totalPaginas: 0, desde: '2026-09-22T00:00:00', hasta: '2026-10-05T00:00:00' } }));
    component.telefono = '(351) 123-4567';
    component.buscar();
    expect(obtenerPedidosRecientes).toHaveBeenCalledWith('3511234567', 1);
    expect(component.desde).toBe('2026-09-22T00:00:00');
    expect(component.hasta).toBe('2026-10-05T00:00:00');
    expect(component.consultado()).toBe(true);
    expect(component.pedidos()).toEqual([]);
    expect(component.cargando()).toBe(false);
  });

  it('mantiene el teléfono consultado al cambiar de página', () => {
    obtenerPedidosRecientes.mockReturnValue(of({ success: true, data: { items: [], totalPaginas: 2 } }));
    component.telefono = '3511234567';
    component.buscar();
    component.telefono = '3519999999';
    component.cargar(2);
    expect(obtenerPedidosRecientes).toHaveBeenLastCalledWith('3511234567', 2);
    expect(component.pagina()).toBe(2);
  });

  it('evita consultas duplicadas mientras carga', () => {
    obtenerPedidosRecientes.mockReturnValue(new Subject());
    component.telefono = '3511234567';
    component.buscar();
    component.buscar();
    expect(obtenerPedidosRecientes).toHaveBeenCalledTimes(1);
  });

  it('muestra un error recuperable cuando falla la conexión', () => {
    obtenerPedidosRecientes.mockReturnValue(throwError(() => new Error('offline')));
    component.telefono = '3511234567';
    component.buscar();
    expect(component.error()).toContain('Intentá nuevamente');
    expect(component.cargando()).toBe(false);
    expect(component.consultado()).toBe(false);
  });
});
