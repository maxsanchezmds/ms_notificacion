import { Injectable } from '@nestjs/common';
import { DatabasePool } from './database-pool';
import { getDatabaseSchema, getNotificacionTableName, quoteIdentifier } from './database-schema';

@Injectable()
export class DatabaseInitializer {
  constructor(private readonly databasePool: DatabasePool) {}

  async ensureSchema(): Promise<void> {
    const schema = getDatabaseSchema();
    const notificacionTableName = getNotificacionTableName();

    await this.databasePool.query(`CREATE SCHEMA IF NOT EXISTS ${quoteIdentifier(schema)}`);
    await this.databasePool.query(`
      CREATE TABLE IF NOT EXISTS ${notificacionTableName} (
        id_notificacion UUID PRIMARY KEY,
        fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        mensaje TEXT NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'sin entregar' CHECK (
          status IN ('entregado', 'sin entregar', 'esperando revision')
        )
      )
    `);
  }
}
