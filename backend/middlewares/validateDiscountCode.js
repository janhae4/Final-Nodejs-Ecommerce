const DiscountService = require("../services/discountService");

const discountAmount = (totalAmount, discountCode) => {
  return discountCode.type === "fixed"
    ? discountCode.value
    : (totalAmount * discountCode.value) / 100;
};

module.exports = async(req, res, next) => {
    try {
        const {discountCode} = req.body;
        if (!discountCode) {
            return next();
        }
        await DiscountService.updateUsedCount(discountCode);
        next();
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
