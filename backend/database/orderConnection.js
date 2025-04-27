const mongoose = require('mongoose');
require('dotenv').config()

const orderConnection = mongoose.createConnection(process.env.ORDER_DB_URI);
module.exports = orderConnection;