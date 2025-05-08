const express = require("express");
const router = express.Router();
const orderCotroller = require("../controllers/orderController");
const validateDiscountCode = require("../middlewares/validateDiscountCode");

router.get("/", orderCotroller.getOrders);
router.get("/all", orderCotroller.getAllOrders);
router.post("/", validateDiscountCode, orderCotroller.createOrder);
router.get("/:orderId", orderCotroller.getOrderById);
router.get("/code/:code", orderCotroller.getOrderByDiscountCode);
router.patch("/:orderId/status", orderCotroller.patchStatusOrder);
router.patch("/:orderId", validateDiscountCode, orderCotroller.patchOrder);
router.put("/:orderId", validateDiscountCode, orderCotroller.updateOrder);
router.delete("/:orderId", orderCotroller.deleteOrderById);
module.exports = router;
