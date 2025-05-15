const { consumeFromQueue } = require("../database/rabbitmqConnection");
const productService = require("../services/productService");
const ORDER_EVENT_EXCHANGE = "order_events_exchange";
const QUEUE_NAME = "inventory_update_queue";

const handleOrderCreated = async (eventData) => {
  console.log(
    "[InventoryConsumer] Processing order.created for inventory update:",
    eventData.orderCode
  );
  try {
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
    await productSession.commitTransaction();
    console.log(
      `[InventoryConsumer] Inventory updated successfully for order ${eventData.orderCode}`
    );
  } catch (error) {
    console.error(
      `[InventoryConsumer] Error updating inventory for order ${eventData.orderCode}:`,
      error
    );
    if (productSession.inTransaction()) {
      await productSession.abortTransaction();
    }
    throw error;
  } finally {
    productSession.endSession();
  }
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
