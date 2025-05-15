const { consumeFromQueue } = require("../database/rabbitmqConnection");
const authService = require("../services/authService");
const redisService = require("../services/redisService");
const ORDER_EVENT_EXCHANGE = "order_events_exchange";
const AUTH_EVENT_EXCHANGE = "auth_events_exchange";

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

const handleLoyaltyAdded = async (eventData) => {
  try {
    console.log(
      "[LoyaltyConsumer] Processing auth.user.created event:",
      eventData.user.fullName
    );
    const guestInfo = await redisService.getInfo(eventData.oldUserId);
    console.log(guestInfo.loyaltyPoints, eventData);
    await authService.addLoyaltyPoints(eventData.user.id, Number(guestInfo.loyaltyPoints));
    redisService.cleanUp(eventData.oldUserId);
    console.log(
      `[LoyaltyConsumer] Loyalty points updated for user ${eventData.user.fullName}`
    );
  } catch (error) {
    console.error(error);
  }
};

const start = async () => {
  await consumeFromQueue(
    "loyalty_queue",
    ORDER_EVENT_EXCHANGE,
    "order.created",
    handleLoyalty
  );

  await consumeFromQueue(
    "loyalty_added_queue",
    AUTH_EVENT_EXCHANGE,
    "auth.user.registered",
    handleLoyaltyAdded
  );
};

module.exports = { start };
