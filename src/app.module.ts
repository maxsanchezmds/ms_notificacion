import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { DatabaseInitializer } from './notificacion/database-initializer';
import { DatabasePool } from './notificacion/database-pool';
import { NotificacionController } from './notificacion/notificacion.controller';
import { NotificacionRepository } from './notificacion/notificacion.repository';
import { PedidoCanceladoConsumer } from './notificacion/pedido-cancelado.consumer';

@Module({
  controllers: [HealthController, NotificacionController],
  providers: [DatabasePool, DatabaseInitializer, NotificacionRepository, PedidoCanceladoConsumer],
})
export class AppModule {}
