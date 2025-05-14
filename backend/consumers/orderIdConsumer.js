const { consumeFromQueue } = require("../database/rabbitmqConnection");
const orderService = require("../services/orderService");
const ORDER_EVENT_EXCHANGE = "order_events_exchange";
const QUEUE_NAME = "order_id_queue";

const handleUpdateOrderId = async (eventData) => {
  console.log(
    "[OrderConsumer] Processing order.created event:",
    eventData.orderCode
  );
  await orderService.updateOrderUserId(
    eventData.oldUserId,
    eventData.newUserId
  );
  console.log(
    `[OrderConsumer] Order ID updated for order ${eventData.orderCode}`
  );
};

const start = async () => {
  await consumeFromQueue(
    QUEUE_NAME,
    ORDER_EVENT_EXCHANGE,
    "order.converter",
    handleUpdateOrderId
  );
};

module.exports = { start };
