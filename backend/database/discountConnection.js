const mongoose = require('mongoose');

const discountConnection = mongoose.createConnection(process.env.DISCOUNT_DB_URI);
module.exports = discountConnection;