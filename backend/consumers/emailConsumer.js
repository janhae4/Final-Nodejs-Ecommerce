const { consumeFromQueue } = require("../database/rabbitmqConnection");
const emailService = require("../services/emailService");
const ORDER_EVENT_EXCHANGE = "order_events_exchange";
const AUTH_EVENT_EXCHANGE = "auth_events_exchange";
const NOTIFICATION_ORDER_CREATED_QUEUE = "notification_order_created_queue";
const NOTIFICATION_REGISTER_QUEUE = "notification_register_queue";
const NOTIFICATION_RECOVERY_QUEUE = "notification_recovery_queue";
const NOTIFICATION_ORDER_CREATED_QUEUE = "notification_order_created_queue";
const NOTIFICATION_REGISTER_QUEUE = "notification_register_queue";
const NOTIFICATION_RECOVERY_QUEUE = "notification_recovery_queue";

const handleOrderCreated = async (eventData) => {
  console.log(
    "[NotificationConsumer] Processing order.created event: ",
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
    eventData.email
  );

  await emailService.sendRegisterConfirmation(
    eventData.fullName,
    eventData.email,
    eventData.password
  );

  console.log(
    `[NotificationConsumer] Confirmation register email sent for ${eventData.fullName}`
  );
};

const handleRecoveryPassword = async (eventData) => {
  console.log(
    "[NotificationConsumer] Processing auth.user.changed event:",
    "[NotificationConsumer] Processing auth.user.changed event:",
    eventData.user
  );

  await emailService.sendRevoveryPassword(eventData.user, eventData.password);

  console.log(
    `[NotificationConsumer] Confirmation email sent for recovery ${eventData.user}`
  );
};

const start = async () => {
  await consumeFromQueue(
    NOTIFICATION_ORDER_CREATED_QUEUE,
    NOTIFICATION_ORDER_CREATED_QUEUE,
    ORDER_EVENT_EXCHANGE,
    "order.created",
    handleOrderCreated
  );


  await consumeFromQueue(
    NOTIFICATION_REGISTER_QUEUE,
    NOTIFICATION_REGISTER_QUEUE,
    AUTH_EVENT_EXCHANGE,
    "auth.user.registered",
    "auth.user.registered",
    handleRegisterSuccess
  );

  await consumeFromQueue(
    NOTIFICATION_RECOVERY_QUEUE,
    NOTIFICATION_RECOVERY_QUEUE,
    AUTH_EVENT_EXCHANGE,
    "auth.user.changed",
    "auth.user.changed",
    handleRecoveryPassword
  );
};

module.exports = { start };
