const DiscountCode = require('../models/DiscountCode');

exports.createDiscountCode = async (discountData) => {
    try {
        const existingDiscountCode = await DiscountCode.findOne({ code: discountData.code });
        if (existingDiscountCode) {
            throw new Error('Discount code already exists');
        }
        const newDiscountCode = new DiscountCode(discountData);
        await newDiscountCode.save();
        return newDiscountCode;
    } catch (error) {
        throw new Error('Error creating discount code: ' + error.message);
    }
};

exports.getAllDiscountCodes = async (skip, limit) => {
    try {
        const discountCodes = await DiscountCode.find()
            .skip(skip)
            .limit(limit);
        return discountCodes;
    } catch (error) {
        throw new Error('Error fetching discount codes: ' + error.message);
    }
};

exports.getDiscountCount = async () => {
    try {
        const count = await DiscountCode.countDocuments();
        return count;
    } catch (error) {
        throw new Error('Error fetching discount count: ' + error.message);
    }
};

exports.getAllActiveDiscountCodes = async () => {
    try {
        const activeDiscountCodes = await DiscountCode.find({ status: 'active' });
        return activeDiscountCodes;
    } catch (error) {
        throw new Error('Error fetching active discount codes: ' + error.message);
    }
};

exports.patchDiscount = async (id, updateData) => {
    try {
        const discountCode = await DiscountCode.findById(id);
        if (!discountCode) {
            throw new Error('Discount code not found');
        }

        return await discountCode.updateOne(updateData);
    } catch (error) {
        throw new Error('Error updating discount code: ' + error.message);
    }
};

exports.deleteDiscountCode = async (id) => {
    try {
        const discountCode = await DiscountCode.findById(id);
        if (!discountCode) {
            throw new Error('Discount code not found');
        }

        await DiscountCode.deleteOne({ _id: id });
        return { message: 'Discount code deleted successfully' };
    } catch (error) {
        throw new Error('Error deleting discount code: ' + error.message);
    }
};