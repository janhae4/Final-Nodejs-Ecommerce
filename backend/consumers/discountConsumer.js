const { consumeFromQueue } = require("../database/rabbitmqConnection");
const ORDER_EVENT_EXCHANGE = "order_events_exchange";
const QUEUE_NAME = "discount_queue";
const discountService = require("../services/discountService");
const handleOrderCreated = async (order) => {
  if (!order.discountInfo.code) return;
  console.log(
    "[DiscountConsumer] Processing order.created for discount update: ",
    order.discountInfo?.code
  );
  await discountService.updateUsedCount(order.discountInfo.code);
  console.log(
    "[DiscountConsumer] Done order.created for discount update: ",
    order.discountInfo?.code
  );
};

const start = async () => {
  await consumeFromQueue(
    QUEUE_NAME,
    ORDER_EVENT_EXCHANGE,
    "order.created",
    handleOrderCreated
  );
};

module.exports = { start };
