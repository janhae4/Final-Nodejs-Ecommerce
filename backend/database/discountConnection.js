const mongoose = require('mongoose');
require('dotenv').config()

const discountConnection = mongoose.createConnection(process.env.DISCOUNT_DB_URI);
module.exports = discountConnection;