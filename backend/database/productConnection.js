const mongoose = require('mongoose');
require('dotenv').config();

const productConnection = mongoose.createConnection(process.env.PRODUCT_DB_URI);
module.exports = productConnection;