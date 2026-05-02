# ms_notificacion

Microservicio NestJS en TypeScript para registrar notificaciones derivadas de eventos de pedidos.

## Comportamiento

- Consume mensajes desde SQS usando `QUEUE_URL`.
- Cuando recibe el evento `pedido_cancelado` con `pedido.id_pedido`, inserta un registro en la tabla `notificacion`.
- El mensaje registrado es `Buenas tardes estimado/a su pedido fue cancelado con exito`.
- El estado inicial es `sin entregar`.
- La fecha se resuelve en PostgreSQL con `NOW()`.
- La PK se genera como UUID.
- `notificacion.id_pedido` referencia al pedido cancelado. La FK contra `pedidos(id_pedido)` se declara automaticamente cuando ambas tablas existen en la misma base y schema PostgreSQL.

## Variables de entorno

- `PORT`: puerto HTTP. Default `3000`.
- `DATABASE_URL`: URL PostgreSQL completa.
- `DATABASE_SCHEMA`: schema PostgreSQL a usar. Default `public`.
- `QUEUE_URL`: URL de la cola SQS del microservicio.

Tambien se soportan `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER` y `DATABASE_PASSWORD`.

## Desarrollo

- `npm run build` compila TypeScript estricto a `dist`.
- `npm test` compila la suite a `dist-test` y ejecuta Jest.
- `npm start` ejecuta `dist/main.js`.

## CI/CD

- PR: crea un preview aislado con `srv-notificaciones-pr-<numero>`, una cola SQS preview, una suscripcion SNS filtrada a `pedido_cancelado`, un schema `pr_<numero>` y un Kong preview para smoke tests.
- Cierre de PR: elimina ECS/Kong preview, cola SQS, suscripcion SNS y schema efimero.
- `main`: construye la imagen, la publica en ECR y despliega ECS con promocion estable/canary coherente con el gateway.
