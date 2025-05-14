const express = require("express");
const router = express.Router();
const guestController = require("../controllers/redisController");

router.get("/orders/:orderId", guestController.getOrders);
router.post("/orders", guestController.createOrder);

router.get("/shipping-addresses/:guestId", guestController.getGuestAddresses);
router.post("/shipping-addresses", guestController.addAddress);

router.put("/shipping-addresses/:guestId", guestController.updateGuestAddress);
router.delete("/shipping-addresses/:guestId/:addressId", guestController.deleteGuestAddress);

router.get("/cart/:guestId", guestController.getCart);
router.post("/cart", guestController.addCart);
router.put("/cart/:guestId", guestController.updateCart);
router.delete("/cart/:guestId", guestController.deleteCart);

router.get("/info/:guestId", guestController.getInfo);
router.put("/info/:guestId", guestController.updateInfo);
router.post("/info/:guestId", guestController.addInfo);

module.exports = router;
