const discountService = require('../services/discountService');

exports.getAllDiscount = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totalCount = await discountService.getDiscountCount();
        const totalPages = Math.ceil(totalCount / limit);        
        const discounts = await discountService.getAllDiscountCodes({ skip, limit });
        res.status(200).json({
            discounts,
            totalPages,    
            currentPage: page, 
            totalCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.createDiscount= async (req, res) => {
    try {
        const Discount = await discountService.createDiscountCode(req.body);
        res.status(201).json(Discount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.patchDiscount = async (req, res) => {
    try {
        const discountId = req.params.discountId;
        const discount = await discountService.patchDiscount(discountId, req.body);
        if (!discount) {
            return res.status(404).json({ message: 'Discount not found' });
        }
        res.json(discount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDiscountActive = async (req, res) => {
    try {
        const discountId = req.params.discountId;
        const discount = await discountService.getAllActiveDiscountCodes(discountId);
        if (!discount) {
            return res.status(404).json({ message: 'Discount not found' });
        }
        res.status(200).json(discount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};