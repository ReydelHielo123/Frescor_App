export interface iTelefonoDireccion {
  id: number;
  telefono: string;
  direccion: string;
  direccionMayusculas: string;
  zona: number;
  cuponDescuento: number;
  nombreCupon: string;
  otrosMediosPago?: string;
}