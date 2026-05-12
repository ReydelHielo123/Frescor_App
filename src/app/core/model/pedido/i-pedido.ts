export interface IPedido {
    id?: number;
    direccion: string;
    kg10_5: number;
    kg2_5: number;
    kg1_5: number;
    kg4_5: number;
    triturado: number;
    fecha_Carga: string;
    precio_Total: string;
    zona: number;
    formaPago: string;
    paymentId?: string | null;
    estado: string;
}
