const DiscountCode = require("../models/DiscountCode");

exports.createDiscountCode = async (discountData) => {
  try {
    const existingDiscountCode = await DiscountCode.findOne({
      code: discountData.code,
    });
    if (existingDiscountCode) {
      throw new Error("Discount code already exists");
    }
    const newDiscountCode = new DiscountCode(discountData);
    await newDiscountCode.save();
    return newDiscountCode;
  } catch (error) {
    throw new Error("Error creating discount code: " + error.message);
  }
};

exports.getAllDiscountCodes = async (skip, limit, search) => {
  try {
    const discountCodes = await DiscountCode.find({
      $or: [
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    })
      .skip(skip)
      .limit(limit);
    return discountCodes;
  } catch (error) {
    throw new Error("Error fetching discount codes: " + error.message);
  }
};

exports.getDiscountCount = async (search) => {
  try {
    const count = await DiscountCode.countDocuments({
      $or: [
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    });
    return count;
  } catch (error) {
    throw new Error("Error fetching discount count: " + error.message);
  }
};

exports.getDiscountById = async (id) => {
  try {
    const discountCode = await DiscountCode.findById(id);
    return discountCode;
  } catch (error) {
    throw new Error("Error fetching discount code by ID: " + error.message);
  }
};

exports.getDiscountByCode = async (code) => {
  try {
    const discountCode = await DiscountCode.findOne({ code: code });
    return discountCode;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getAllActiveDiscountCodes = async () => {
  try {
    const activeDiscountCodes = await DiscountCode.find({ status: "active" });
    return activeDiscountCodes;
  } catch (error) {
    throw new Error("Error fetching active discount codes: " + error.message);
  }
};
exports.getMostUsedDiscount = async () => {
  try {
    console.log(2323);
    return await DiscountCode.findOne().sort({ usedCount: -1 });
  } catch (error) {
    throw new Error("Error fetching active discount codes: " + error.message);
  }
};

exports.getActiveDiscountLength = async () => {
  try {
    return await DiscountCode.countDocuments({ status: "active" });
  } catch (error) {
    throw new Error("Error fetching active discount codes: " + error.message);
  }
};

exports.getInactiveDiscountLength = async () => {
  try {
    return await DiscountCode.countDocuments({ status: "inactive" });
  } catch (error) {
    throw new Error("Error fetching active discount codes: " + error.message);
  }
};

exports.updateDiscount = async (id, updateData) => {
  return await DiscountCode.findByIdAndUpdate(id, updateData, { new: true });
};

exports.patchDiscount = async (id, updateData) => {
  const discountCode = await DiscountCode.findOneAndUpdate(
    { _id: id },
    updateData,
    {
      new: true,
    }
  );
  if (!discountCode) {
    throw new Error("Discount code not found");
  }
  return discountCode;
};

exports.deleteDiscountCode = async (id) => {
  try {
    await DiscountCode.findByIdAndDelete(id);
    return { message: "Discount code deleted successfully" };
  } catch (error) {
    throw new Error("Discount code not found");
  }
};

exports.updateUsedCount = async (code) => {
    try {

        const discountCodeUpdated = await DiscountCode.findOneAndUpdate(
            {
                code: code,
                $expr: { $lt: ["$usedCount", "$usageLimit"] },
            },
            {
                $inc: { usedCount: 1 },
            },
            {
                new: true,
            }
        );
                
        if (!discountCodeUpdated) {
            throw new Error("Discount code not found or has been used up");
        }
        
        return discountCodeUpdated;
    } catch (error) {
        throw new Error("Error updating used count: " + error.message);
    }
};
