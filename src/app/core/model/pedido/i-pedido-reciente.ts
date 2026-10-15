import { IPedido } from './i-pedido';
export type IPedidoReciente = Pick<IPedido, 'id' | 'kg1_5' | 'kg2_5' | 'kg4_5' | 'kg10_5' | 'triturado' | 'fecha_Carga' | 'precio_Total' | 'formaPago' | 'estado'>;
export interface IPedidosRecientes {
  items: IPedidoReciente[];
  totalRegistros: number;
  pagina: number;
  tamañoPagina: number;
  totalPaginas: number;
  desde: string;
  hasta: string;
}
