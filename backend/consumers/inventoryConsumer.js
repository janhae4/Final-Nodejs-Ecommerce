const { consumeFromQueue } = require("../database/rabbitmqConnection");
const Product = require("../models/Product");
const ORDER_EVENT_EXCHANGE = "order_events_exchange";

const QUEUE_NAME = "inventory_update_queue";

const handleOrderCreated = async (eventData) => {
  console.log(
    "[InventoryConsumer] Processing order.created for inventory update:",
    eventData.orderCode
  );
  const productSession = await Product.startSession();
  productSession.startTransaction();
  try {
    for (const item of eventData.products) {
      const product = await Product.findById(item.productId).session(
        productSession
      );
      if (!product) {
        throw new Error(
          `Product ${item.productId} not found during inventory update for order ${eventData.orderCode}`
        );
      }
      const variant = product.variants.id(item.variantId);
      if (!variant) {
        throw new Error(
          `Variant ${item.variantId} for product ${item.productId} not found during inventory update for order ${eventData.orderCode}`
        );
      }

      if (variant.inventory < item.quantity) {
        console.error(
          `CRITICAL: Out of stock for product ${item.productId}, variant ${item.variantId} for order ${eventData.orderCode} AFTER order creation. Available: ${variant.inventory}, Needed: ${item.quantity}`
        );      
        throw new Error(`Inventory issue for order ${eventData.orderCode}`); 
      }

      variant.inventory -= item.quantity;
      variant.used = (variant.used || 0) + item.quantity;
      await product.save({ session: productSession });
      console.log(
        `[InventoryConsumer] Updated inventory for product ${item.productId}, variant ${item.variantId}. New inventory: ${variant.inventory}`
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
