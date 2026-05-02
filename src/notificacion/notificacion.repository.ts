import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { DatabasePool } from './database-pool';
import { getNotificacionTableName } from './database-schema';
import { NOTIFICACION_CANCELACION_MENSAJE, Notificacion } from './notificacion.types';

@Injectable()
export class NotificacionRepository {
  private readonly notificacionTableName: string;

  constructor(private readonly databasePool: DatabasePool) {
    this.notificacionTableName = getNotificacionTableName();
  }

  async createPedidoCancelado(idPedido: string): Promise<Notificacion> {
    const result = await this.databasePool.query<Notificacion>(
      `
        INSERT INTO ${this.notificacionTableName} (id_notificacion, id_pedido, mensaje)
        VALUES ($1, $2, $3)
        RETURNING id_notificacion, id_pedido, fecha, mensaje, status
      `,
      [randomUUID(), idPedido, NOTIFICACION_CANCELACION_MENSAJE],
    );

    return result.rows[0] as Notificacion;
  }
}
