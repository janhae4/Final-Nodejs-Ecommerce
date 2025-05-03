const mongoose = require('mongoose');
require('dotenv').config()

const discountConnection = mongoose.createConnection(process.env.Discount_DB_URI);
module.exports = discountConnection;