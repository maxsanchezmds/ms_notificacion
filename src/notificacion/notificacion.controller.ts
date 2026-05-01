import { Controller, Get } from '@nestjs/common';

interface NotificacionHealthResponse {
  status: 'ok';
  service: 'notificaciones';
}

@Controller('api/notificaciones')
export class NotificacionController {
  @Get()
  getHealth(): NotificacionHealthResponse {
    return {
      status: 'ok',
      service: 'notificaciones',
    };
  }
}
