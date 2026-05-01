import { NotificacionController } from './notificacion.controller';

describe('NotificacionController', () => {
  test('expone health operacional bajo api/notificaciones', () => {
    const controller = new NotificacionController();

    expect(controller.getHealth()).toEqual({
      status: 'ok',
      service: 'notificaciones',
    });
  });
});
