const { consumeFromQueue } = require("../database/rabbitmqConnection");
const productService = require("../services/productService");
const ORDER_EVENT_EXCHANGE = "order_events_exchange";
const QUEUE_NAME = "inventory_update_queue";

const handleOrderCreated = async (eventData) => {
  console.log(
    "[InventoryConsumer] Processing order.created for inventory update:",
    eventData.orderCode
  );

  for (const item of eventData.products) {
    await productService.increaseUsed(
      item.productId,
      item.variantId,
      item.quantity
    );
    console.log(
      `[InventoryConsumer] Updated inventory for product ${item.productId}, variant ${item.variantId}.`
    );
  }
  console.log(
    `[InventoryConsumer] Inventory updated successfully for order ${eventData.orderCode}`
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
