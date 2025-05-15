const { consumeFromQueue } = require("../database/rabbitmqConnection");
const orderService = require("../services/orderService");
const AUTH_EVENTS_EXCHANGE = "auth_events_exchange";
const QUEUE_NAME = "order_id_queue";

const handleUpdateOrderId = async (eventData) => {
  console.log("[OrderConsumer] Processing auth.user.registered event:");
  await orderService.updateOrderUserId(
    eventData.oldUserId,
    eventData.user.id
  );
  console.log(
    `[OrderConsumer] Order ID updated for user ${eventData.user.id}`
  );
};

const start = async () => {
  await consumeFromQueue(
    "register_success_queue",
    AUTH_EVENTS_EXCHANGE,
    "auth.user.registered",
    handleUpdateOrderId
  );
};

module.exports = { start };
