export const PEDIDO_CANCELADO_EVENTO = 'pedido_cancelado';
export const NOTIFICACION_CANCELACION_MENSAJE = 'Buenas tardes estimado/a su pedido fue cancelado con exito';

export type NotificacionStatus = 'entregado' | 'sin entregar' | 'esperando revision';

export interface Notificacion {
  id_notificacion: string;
  id_pedido: string;
  fecha: Date;
  mensaje: string;
  status: NotificacionStatus;
}

export interface Mensajeria {
  id_mensaje: string;
  asunto: string;
  cuerpo: string;
  responsable: string;
  fecha_envio: Date;
  destinatarios: string[];
}

export interface CreateMensajeriaRequest {
  asunto?: unknown;
  cuerpo?: unknown;
  responsable?: unknown;
  fecha_envio?: unknown;
  destinatarios?: unknown;
}

export type UpdateMensajeriaRequest = CreateMensajeriaRequest;

export type CreateMensajeriaData = Mensajeria;

export type MensajeriaUpdateFields = Partial<Omit<Mensajeria, 'id_mensaje'>>;
