const mongoose = require('mongoose');
require('dotenv').config();

const userConnection = mongoose.createConnection(process.env.USER_DB_URI);
const productConnection = mongoose.createConnection(process.env.PRODUCT_DB_URI);
const discountConnection = mongoose.createConnection(process.env.DISCOUNT_DB_URI);
const orderConnection = mongoose.createConnection(process.env.ORDER_DB_URI);

module.exports = {userConnection, productConnection, discountConnection, orderConnection};
