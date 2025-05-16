const { consumeFromQueue } = require("../database/rabbitmqConnection");
const redisService = require("../services/redisService");
const ORDER_EVENT_EXCHANGE = "order_events_exchange";
const QUEUE_NAME = "redis_queue";

const handleOrderCreated = async (eventData) => {
  if (!eventData.guestId) return
  console.log(
    "[RedisConsumer] Processing order.created for redis update:",
    eventData.orderCode
  );
  await redisService.cleanUp(eventData.guestId);
  console.log(`[RedisConsumer] Updated redis for order ${eventData.orderCode}`);
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
