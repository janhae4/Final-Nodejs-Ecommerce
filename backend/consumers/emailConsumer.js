const { consumeFromQueue } = require("../database/rabbitmqConnection");
const emailService = require("../services/emailService");
const ORDER_EVENT_EXCHANGE = "order_events_exchange";
const AUTH_EVENT_EXCHANGE = "auth_events_exchange";
const QUEUE_NAME = "notification_queue";

const handleOrderCreated = async (eventData) => {
  console.log(
    "[NotificationConsumer] Processing order.created event:",
    eventData.orderCode
  );

  await emailService.sendOrderConfirmation(eventData);

  console.log(
    `[NotificationConsumer] Confirmation email sent for order ${eventData.orderCode}`
  );
};

const handleRegisterSuccess = async (eventData) => {
  console.log(
    "[NotificationConsumer] Processing auth.user.created event:",
    eventData.user
  );

  await emailService.sendRegisterConfirmation(
    eventData.user,
    eventData.password
  );

  console.log(
    `[NotificationConsumer] Confirmation email sent for order ${eventData.orderCode}`
  );
};

const handleRecoveryPassword = async (eventData) => {
  console.log(
    "[NotificationConsumer] Processing auth.user.recovery event:",
    eventData.user
  );

  await emailService.sendRevoveryPassword(eventData.user, eventData.password);

  console.log(
    `[NotificationConsumer] Confirmation email sent for order ${eventData.orderCode}`
  )
};

const start = async () => {
  await consumeFromQueue(
    QUEUE_NAME,
    ORDER_EVENT_EXCHANGE,
    "order.created",
    handleOrderCreated
  );
  await consumeFromQueue(
    QUEUE_NAME,
    AUTH_EVENT_EXCHANGE,
    "auth.user.created",
    handleRegisterSuccess
  );

  await consumeFromQueue(
    QUEUE_NAME,
    AUTH_EVENT_EXCHANGE,
    "auth.user.recovery",
    handleRecoveryPassword
  );
};

module.exports = { start };
