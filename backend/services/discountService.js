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

exports.getAllDiscountCodes = async (skip, limit, search) => {
    try {
        const discountCodes = await DiscountCode.find({
            $or: [
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        })
            .skip(skip)
            .limit(limit);
        return discountCodes;
    } catch (error) {
        throw new Error('Error fetching discount codes: ' + error.message);
    }
};

exports.getDiscountCount = async (search) => {
    try {
        const count = await DiscountCode.countDocuments({
            $or: [
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ]
        });
        return count;
    } catch (error) {
        throw new Error('Error fetching discount count: ' + error.message);
    }
};

exports.getDiscountById = async (id) => {
    try {
        const discountCode = await DiscountCode.findById(id);
        return discountCode;
    } catch (error) {
        throw new Error('Error fetching discount code by ID: ' + error.message);
    }
}

exports.getAllActiveDiscountCodes = async () => {
    try {
        const activeDiscountCodes = await DiscountCode.find({ status: 'active' });
        return activeDiscountCodes;
    } catch (error) {
        throw new Error('Error fetching active discount codes: ' + error.message);
    }
};
exports.getMostUsedDiscount = async () => {
    try {
        console.log(2323)
        return await DiscountCode.findOne().sort({ usedCount: -1 });
    } catch (error) {
        throw new Error('Error fetching active discount codes: ' + error.message);
    }
}

exports.getActiveDiscountLength = async () => {
    try {
        return await DiscountCode.countDocuments({ status: 'active' });
    } catch (error) {
        throw new Error('Error fetching active discount codes: ' + error.message);
    }
}

exports.getInactiveDiscountLength = async () => {
    try {
        return await DiscountCode.countDocuments({ status: 'inactive' });
    } catch (error) {
        throw new Error('Error fetching active discount codes: ' + error.message);
    }
}

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