const { consumeFromQueue } = require("../database/rabbitmqConnection");
const authService = require("../services/authService");
const ORDER_EVENT_EXCHANGE = "order_events_exchange";
const QUEUE_NAME = "loyalty_queue";

const handleLoyalty = async (eventData) => {
  console.log(
    "[LoyaltyConsumer] Processing order.created event:",
    eventData.orderCode
  );
  if (eventData.isGuest) {
    return;
  }
  await authService.addLoyaltyPoints(
    eventData.userId,
    eventData.loyaltyPointsEarned - eventData.loyaltyPointsUsed
  );
  console.log(
    `[LoyaltyConsumer] Loyalty points updated for user ${eventData.userId}`
  );
};

const start = async () => {
  await consumeFromQueue(
    "loyalty_queue",
    ORDER_EVENT_EXCHANGE,
    "order.created",
    handleLoyalty
  );
};

module.exports = { start };
