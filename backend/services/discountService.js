const discount = require('../model/DiscountCode');

exports.createDiscountCode = async (req, res) => {
    try {
        const newDiscountCode = await discount.create(req.body);
        res.status(201).json(newDiscountCode);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllDiscountCodes = async (req, res) => {
    try {
        const discountCodes = await discount.find();
        res.status(200).json(discountCodes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllDiscountCodesActive = async (req, res) => {
    try {
        const discountCodes = await discount.find({ status: 'active' });
        res.status(200).json(discountCodes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.patchDiscountCode = async (req, res) => {
    try {
        const discountCode = await discount.findOneAndUpdate({ code: req.params.code }, req.body, { new: true });
        if (!discountCode) {
            return res.status(404).json({ message: 'Discount code not found' });
        }
        res.json(discountCode);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
