import { PEDIDO_CANCELADO_EVENTO } from './notificacion.types';
import { NotificacionRepository } from './notificacion.repository';
import { PedidoCanceladoConsumer } from './pedido-cancelado.consumer';

type NotificacionRepositoryMock = jest.Mocked<Pick<NotificacionRepository, 'createPedidoCancelado'>>;

describe('PedidoCanceladoConsumer', () => {
  const idPedido = '7d25ed8e-471e-4d1a-a432-bfccca5cfe4f';
  const repository: NotificacionRepositoryMock = {
    createPedidoCancelado: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository.createPedidoCancelado.mockResolvedValue({
      id_notificacion: 'c09d1c90-6294-4a8b-b4d7-3e98e2dc89df',
      id_pedido: idPedido,
      fecha: new Date(),
      mensaje: 'Buenas tardes estimado/a su pedido fue cancelado con exito',
      status: 'sin entregar',
    });
  });

  test('registra notificacion con el id_pedido recibido desde SQS', async () => {
    const consumer = createConsumer();

    await consumer.processMessage({
      Body: JSON.stringify({
        evento: PEDIDO_CANCELADO_EVENTO,
        pedido: {
          id_pedido: idPedido,
        },
      }),
      ReceiptHandle: 'receipt-handle',
    });

    expect(repository.createPedidoCancelado).toHaveBeenCalledWith(idPedido);
    expect(consumer.sqsClient.send).toHaveBeenCalledTimes(1);
  });

  test('ignora eventos pedido_cancelado sin id_pedido valido', async () => {
    const consumer = createConsumer();

    await consumer.processMessage({
      Body: JSON.stringify({
        evento: PEDIDO_CANCELADO_EVENTO,
        pedido: {
          id_pedido: 'no-es-uuid',
        },
      }),
      ReceiptHandle: 'receipt-handle',
    });

    expect(repository.createPedidoCancelado).not.toHaveBeenCalled();
    expect(consumer.sqsClient.send).toHaveBeenCalledTimes(1);
  });

  function createConsumer(): {
    processMessage: (message: { Body: string; ReceiptHandle: string }) => Promise<void>;
    sqsClient: { send: jest.Mock<Promise<unknown>, [unknown]> };
  } {
    const consumer = new PedidoCanceladoConsumer(repository as unknown as NotificacionRepository) as unknown as {
      queueUrl: string;
      processMessage: (message: { Body: string; ReceiptHandle: string }) => Promise<void>;
      sqsClient: { send: jest.Mock<Promise<unknown>, [unknown]> };
    };

    consumer.queueUrl = 'https://sqs.us-east-1.amazonaws.com/123/notificaciones';
    consumer.sqsClient = {
      send: jest.fn<Promise<unknown>, [unknown]>().mockResolvedValue({}),
    };

    return consumer;
  }
});
