import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DeleteMessageCommand, Message, ReceiveMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { NotificacionRepository } from './notificacion.repository';
import { PEDIDO_CANCELADO_EVENTO } from './notificacion.types';

interface PedidoEventPayload {
  evento?: string;
  pedido?: {
    id_pedido?: unknown;
  };
}

@Injectable()
export class PedidoCanceladoConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PedidoCanceladoConsumer.name);
  private readonly sqsClient = new SQSClient({});
  private readonly queueUrl = process.env.QUEUE_URL?.trim();
  private isRunning = false;
  private poller?: Promise<void>;

  constructor(private readonly notificacionRepository: NotificacionRepository) {}

  onModuleInit(): void {
    if (!this.queueUrl) {
      this.logger.warn('QUEUE_URL no esta configurado; no se consumiran eventos de pedido_cancelado.');
      return;
    }

    this.isRunning = true;
    this.poller = this.pollQueue();
  }

  async onModuleDestroy(): Promise<void> {
    this.isRunning = false;
    await this.poller;
  }

  private async pollQueue(): Promise<void> {
    while (this.isRunning && this.queueUrl) {
      try {
        const response = await this.sqsClient.send(
          new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 20,
            VisibilityTimeout: 30,
          }),
        );

        for (const message of response.Messages ?? []) {
          await this.processMessage(message);
        }
      } catch (error) {
        this.logger.error('Error consumiendo mensajes desde SQS.', error);
        await this.sleep(5000);
      }
    }
  }

  private async processMessage(message: Message): Promise<void> {
    if (!this.queueUrl || !message.ReceiptHandle) {
      return;
    }

    const payload = this.parseMessageBody(message.Body);

    if (payload?.evento === PEDIDO_CANCELADO_EVENTO) {
      const idPedido = this.extractIdPedido(payload);

      if (idPedido) {
        await this.notificacionRepository.createPedidoCancelado(idPedido);
        this.logger.log(`Notificacion registrada para evento pedido_cancelado del pedido ${idPedido}.`);
      } else {
        this.logger.warn('Evento pedido_cancelado ignorado porque no incluye pedido.id_pedido valido.');
      }
    }

    await this.sqsClient.send(
      new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: message.ReceiptHandle,
      }),
    );
  }

  private parseMessageBody(body: string | undefined): PedidoEventPayload | null {
    if (!body) {
      return null;
    }

    try {
      const parsed = JSON.parse(body) as unknown;

      if (this.isPedidoEventPayload(parsed)) {
        return parsed;
      }

      if (this.isSnsEnvelope(parsed)) {
        const snsMessage = JSON.parse(parsed.Message) as unknown;
        return this.isPedidoEventPayload(snsMessage) ? snsMessage : null;
      }
    } catch (error) {
      this.logger.warn(`Mensaje SQS ignorado por JSON invalido: ${(error as Error).message}`);
    }

    return null;
  }

  private isPedidoEventPayload(value: unknown): value is PedidoEventPayload {
    return typeof value === 'object' && value !== null && 'evento' in value;
  }

  private isSnsEnvelope(value: unknown): value is { Message: string } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'Message' in value &&
      typeof (value as { Message: unknown }).Message === 'string'
    );
  }

  private extractIdPedido(payload: PedidoEventPayload): string | null {
    const idPedido = payload.pedido?.id_pedido;

    return typeof idPedido === 'string' && this.isUuid(idPedido) ? idPedido : null;
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  private sleep(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }
}
