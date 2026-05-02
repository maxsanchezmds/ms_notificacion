import { DatabasePool } from './database-pool';
import { NOTIFICACION_CANCELACION_MENSAJE } from './notificacion.types';
import { NotificacionRepository } from './notificacion.repository';

type DatabasePoolMock = jest.Mocked<Pick<DatabasePool, 'query'>>;

describe('NotificacionRepository', () => {
  const databasePool: DatabasePoolMock = {
    query: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('crea notificacion de pedido cancelado con mensaje por defecto', async () => {
    const fecha = new Date();
    const idPedido = '7d25ed8e-471e-4d1a-a432-bfccca5cfe4f';
    databasePool.query.mockResolvedValue({
      rows: [
        {
          id_notificacion: 'c09d1c90-6294-4a8b-b4d7-3e98e2dc89df',
          id_pedido: idPedido,
          fecha,
          mensaje: NOTIFICACION_CANCELACION_MENSAJE,
          status: 'sin entregar',
        },
      ],
      command: 'INSERT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const repository = new NotificacionRepository(databasePool as unknown as DatabasePool);
    const notificacion = await repository.createPedidoCancelado(idPedido);

    expect(notificacion).toEqual({
      id_notificacion: 'c09d1c90-6294-4a8b-b4d7-3e98e2dc89df',
      id_pedido: idPedido,
      fecha,
      mensaje: NOTIFICACION_CANCELACION_MENSAJE,
      status: 'sin entregar',
    });
    expect(databasePool.query).toHaveBeenCalledTimes(1);
    expect(databasePool.query.mock.calls[0]?.[1]?.[1]).toBe(idPedido);
    expect(databasePool.query.mock.calls[0]?.[1]?.[2]).toBe(NOTIFICACION_CANCELACION_MENSAJE);
    expect(databasePool.query.mock.calls[0]?.[1]?.[0]).toEqual(expect.any(String));
  });
});
