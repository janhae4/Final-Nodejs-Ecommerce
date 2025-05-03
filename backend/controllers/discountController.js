const discountService = require('../services/discountService');

exports.getAllDiscount = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;
        const totalCount = await discountService.getDiscountCount(search);
        const totalPages = Math.ceil(totalCount / limit);
        const discounts = await discountService.getAllDiscountCodes(skip, limit, search);
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

exports.getDiscountById = async (req, res) => {
    try {
        const discountId = req.params.discountId;
        const discount = await discountService.getDiscountById(discountId);
        if (!discount) {
            return res.status(404).json({ message: 'Discount not found' });
        }
        res.status(200).json(discount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getMostUsedDiscount = async (req, res) => {
    try {
        const discount = await discountService.getMostUsedDiscount();
        if (!discount) {
            return res.status(404).json({ message: 'Discount not found' });
        }
        res.status(200).json(discount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getActiveDiscountLength = async (req, res) => {
    try {
        const discount = await discountService.getActiveDiscountLength();
        if (!discount) {
            return res.status(404).json({ message: 'Discount not found' });
        }
        res.status(200).json(discount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getInactiveDiscountLength = async (req, res) => {
    try {
        const discount = await discountService.getInactiveDiscountLength();
        res.status(200).json(discount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.createDiscount = async (req, res) => {
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

exports.deleteDiscount = async (req, res) => {
    try {
        const discountId = req.params.discountId;
        const discount = await discountService.deleteDiscountCode(discountId);
        if (!discount) {
            return res.status(404).json({ message: 'Discount not found' });
        }
        res.json({ message: 'Discount deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};