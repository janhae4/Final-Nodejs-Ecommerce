const express = require("express");
const router = express.Router();
const orderCotroller = require("../controllers/orderController");
const validateDiscountCode = require("../middleware/validateDiscountCode");

router.get("/", orderCotroller.getOrders);
router.get("/all", orderCotroller.getAllOrders);
router.post("/", validateDiscountCode, orderCotroller.createOrder);
router.get("/:orderId", orderCotroller.getOrderById);
router.patch("/:orderId/status", orderCotroller.patchStatusOrder);
router.patch("/:orderId", validateDiscountCode, orderCotroller.patchOrder);
router.delete("/:orderId", orderCotroller.deleteOrderById);
module.exports = router;
