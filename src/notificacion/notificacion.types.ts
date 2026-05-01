export const PEDIDO_CANCELADO_EVENTO = 'pedido_cancelado';
export const NOTIFICACION_CANCELACION_MENSAJE = 'Buenas tardes estimado/a su pedido fue cancelado con exito';

export type NotificacionStatus = 'entregado' | 'sin entregar' | 'esperando revision';

export interface Notificacion {
  id_notificacion: string;
  fecha: Date;
  mensaje: string;
  status: NotificacionStatus;
}
